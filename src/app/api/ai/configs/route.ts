
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Initialize configs table
async function ensureTable() {
    try {
        // 先尝试创建表
        await db.execute(`
            CREATE TABLE IF NOT EXISTS ai_configs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                provider TEXT NOT NULL,
                api_key TEXT NOT NULL,
                model TEXT,
                base_url TEXT,
                is_active INTEGER DEFAULT 0,
                created_at TEXT,
                updated_at TEXT
            )
        `);
    } catch (e: any) {
        console.error('Create table error, trying to recreate:', e.message);
        try {
            await db.execute('DROP TABLE IF EXISTS ai_configs');
            await db.execute(`
                CREATE TABLE ai_configs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    api_key TEXT NOT NULL,
                    model TEXT,
                    base_url TEXT,
                    is_active INTEGER DEFAULT 0,
                    created_at TEXT,
                    updated_at TEXT
                )
            `);
        } catch (e2) {
            console.error('Recreate table error:', e2);
        }
    }
}

// 同步 ai_settings 到 ai_configs（如果 ai_configs 为空）
async function syncFromSettings() {
    try {
        // 检查 ai_configs 是否为空
        const configsResult = await db.execute('SELECT * FROM ai_configs LIMIT 1');

        if (configsResult.rows.length > 0) {
            console.log('ai_configs already has data, skip sync');
            return; // 已有配置，不需要同步
        }

        console.log('ai_configs is empty, trying to sync from ai_settings...');

        // 获取 ai_settings 中的配置
        const settingsResult = await db.execute('SELECT * FROM ai_settings WHERE id = 1');
        console.log('ai_settings result:', settingsResult.rows);

        if (settingsResult.rows.length === 0) {
            console.log('No ai_settings found');
            return;
        }

        const settings = settingsResult.rows[0] as any;
        if (!settings.api_key) {
            console.log('No api_key in ai_settings');
            return;
        }

        // 将 ai_settings 导入到 ai_configs
        const now = new Date().toISOString();
        const providerNames: Record<string, string> = {
            zhipu: '智谱 AI',
            openai: 'OpenAI',
            anthropic: 'Anthropic',
            deepseek: 'DeepSeek',
            qwen: '通义千问',
            custom: '自定义配置'
        };
        const name = providerNames[settings.provider] || '默认配置';

        console.log('Inserting config:', { name, provider: settings.provider, model: settings.model });

        await db.execute({
            sql: `INSERT INTO ai_configs (name, provider, api_key, model, base_url, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
            args: [name, settings.provider, settings.api_key, settings.model || '', settings.base_url || '', now, now]
        });

        console.log('Successfully synced ai_settings to ai_configs');
    } catch (e) {
        console.error('Sync from settings error:', e);
    }
}

// GET: 获取所有配置
export async function GET() {
    try {
        await ensureTable();
        await syncFromSettings(); // 自动同步现有配置

        const result = await db.execute('SELECT * FROM ai_configs ORDER BY is_active DESC, id DESC');

        const rows = result.rows.map((row: any) => ({
            ...row,
            isEnabled: Boolean(row.is_active)
        }));

        return NextResponse.json({
            code: 200,
            msg: 'success',
            data: rows
        });
    } catch (error) {
        console.error('Get AI Configs Error:', error);
        return NextResponse.json({
            code: 500, // Changed from 200 to 500 for error
            msg: '获取配置失败',
            data: []
        });
    }
}

// POST: 创建新配置
export async function POST(request: Request) {
    try {
        await ensureTable();
        const { name, provider, api_key, model, base_url, isEnabled } = await request.json();

        if (!name || !api_key) {
            return NextResponse.json({ code: 400, msg: '名称和 API Key 不能为空' });
        }

        const now = new Date().toISOString();
        const isActive = isEnabled ? 1 : 0;

        if (isActive) {
            await db.execute('UPDATE ai_configs SET is_active = 0');
        }

        await db.execute({
            sql: `INSERT INTO ai_configs (name, provider, api_key, model, base_url, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [name, provider || 'custom', api_key, model || '', base_url || '', isActive, now, now]
        });

        return NextResponse.json({ code: 200, msg: isActive ? '配置已添加并激活' : '配置已添加' });
    } catch (error) {
        console.error('Create AI Config Error:', error);
        return NextResponse.json({ code: 500, msg: '添加配置失败' });
    }
}

// PUT: 更新配置
export async function PUT(request: Request) {
    try {
        await ensureTable();
        const { id, name, provider, api_key, model, base_url, isEnabled } = await request.json();

        if (!id) {
            return NextResponse.json({ code: 400, msg: '缺少配置 ID' });
        }

        const now = new Date().toISOString();

        // 构建更新语句，如果有传递 isEnabled 则更新，否则保持原样（这里假设前端总是传全量或者Partial包含）
        // 但为了安全起见，如果 isEnabled 是 boolean 类型，就更新它
        let sql = `UPDATE ai_configs SET name = ?, provider = ?, api_key = ?, model = ?, base_url = ?, updated_at = ?`;
        const args: any[] = [name, provider || 'custom', api_key, model || '', base_url || '', now];

        if (typeof isEnabled === 'boolean' && isEnabled) {
            // 如果要启用当前配置，先将其他所有配置设为禁用
            await db.execute('UPDATE ai_configs SET is_active = 0');
            console.log('Disabled all other configs');
        }

        if (typeof isEnabled === 'boolean') {
            sql += `, is_active = ?`;
            args.push(isEnabled ? 1 : 0);
        }

        sql += ` WHERE id = ?`;
        args.push(id);

        await db.execute({ sql, args });

        return NextResponse.json({ code: 200, msg: isEnabled ? '配置已激活 (其他配置已自动关闭)' : '配置已保存' });
    } catch (error) {
        console.error('Update AI Config Error:', error);
        return NextResponse.json({ code: 500, msg: '更新配置失败' });

    }
}

// DELETE: 删除配置
export async function DELETE(request: Request) {
    try {
        await ensureTable();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ code: 400, msg: '缺少配置 ID' });
        }

        await db.execute({
            sql: `DELETE FROM ai_configs WHERE id = ?`,
            args: [parseInt(id)]
        });

        return NextResponse.json({ code: 200, msg: '配置已删除' });
    } catch (error) {
        console.error('Delete AI Config Error:', error);
        return NextResponse.json({ code: 500, msg: '删除配置失败' });
    }
}
