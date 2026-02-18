
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 激活指定配置
export async function POST(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ code: 400, msg: '缺少配置 ID' });
        }

        // 先将所有配置设为非激活
        await db.execute('UPDATE ai_configs SET is_active = 0');

        // 激活指定配置
        await db.execute({
            sql: 'UPDATE ai_configs SET is_active = 1, updated_at = datetime("now") WHERE id = ?',
            args: [id]
        });

        // 获取激活的配置
        const result = await db.execute({
            sql: 'SELECT * FROM ai_configs WHERE id = ?',
            args: [id]
        });

        if (result.rows.length > 0) {
            const config = result.rows[0];
            // 同时更新 ai_settings 表以保持兼容
            await db.execute(`
                INSERT OR REPLACE INTO ai_settings (id, provider, api_key, model, base_url, updated_at)
                VALUES (1, ?, ?, ?, ?, datetime('now'))
            `, [config.provider, config.api_key, config.model, config.base_url]);
        }

        return NextResponse.json({ code: 200, msg: '配置已激活' });
    } catch (error) {
        console.error('Activate AI Config Error:', error);
        return NextResponse.json({ code: 500, msg: '激活配置失败' });
    }
}
