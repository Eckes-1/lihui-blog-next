
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 手动同步 ai_settings 到 ai_configs
export async function POST() {
    try {
        // 删除旧表并重建
        try {
            await db.execute('DROP TABLE IF EXISTS ai_configs');
        } catch (e) {
            // ignore
        }

        await db.execute(`
            CREATE TABLE ai_configs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                provider TEXT,
                api_key TEXT,
                model TEXT,
                base_url TEXT,
                is_active INTEGER,
                created_at TEXT,
                updated_at TEXT
            )
        `);

        // 获取 ai_settings 中的配置
        const settingsResult = await db.execute('SELECT * FROM ai_settings WHERE id = 1');

        if (settingsResult.rows.length === 0) {
            return NextResponse.json({ code: 400, msg: '没有找到现有配置' });
        }

        const settings = settingsResult.rows[0] as any;
        if (!settings.api_key) {
            return NextResponse.json({ code: 400, msg: '现有配置没有 API Key' });
        }

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

        await db.execute({
            sql: `INSERT INTO ai_configs (name, provider, api_key, model, base_url, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
            args: [name, settings.provider || 'custom', settings.api_key, settings.model || '', settings.base_url || '', now, now]
        });

        return NextResponse.json({ code: 200, msg: '配置已导入' });
    } catch (error: any) {
        console.error('Sync Error:', error);
        return NextResponse.json({ code: 500, msg: '同步失败: ' + error.message });
    }
}
