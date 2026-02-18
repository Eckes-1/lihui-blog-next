
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Initialize settings table if not exists
async function ensureTable() {
    await db.execute(`
    CREATE TABLE IF NOT EXISTS ai_settings (
      id INTEGER PRIMARY KEY,
      provider TEXT NOT NULL DEFAULT 'zhipu',
      api_key TEXT,
      model TEXT,
      base_url TEXT,
      updated_at TEXT
    )
  `);
}

export async function GET() {
    try {
        await ensureTable();

        const result = await db.execute('SELECT * FROM ai_settings WHERE id = 1');

        if (result.rows.length === 0) {
            // Return default settings
            return NextResponse.json({
                code: 200,
                msg: 'success',
                data: {
                    provider: 'zhipu',
                    api_key: '',
                    model: 'glm-4-flash',
                    base_url: ''
                }
            });
        }

        const row = result.rows[0];
        return NextResponse.json({
            code: 200,
            msg: 'success',
            data: {
                provider: row.provider,
                api_key: row.api_key || '',
                model: row.model,
                base_url: row.base_url
            }
        });
    } catch (error) {
        console.error('Get AI Settings Error:', error);
        return NextResponse.json({ code: 500, msg: '获取设置失败' });
    }
}

export async function POST(request: Request) {
    try {
        await ensureTable();

        const { provider, api_key, model, base_url } = await request.json();

        // Check if settings exist
        const existing = await db.execute('SELECT id FROM ai_settings WHERE id = 1');

        if (existing.rows.length === 0) {
            await db.execute({
                sql: `INSERT INTO ai_settings (id, provider, api_key, model, base_url, updated_at) 
              VALUES (1, ?, ?, ?, ?, datetime('now'))`,
                args: [provider, api_key || '', model || '', base_url || '']
            });
        } else {
            // 直接保存用户提交的所有配置
            await db.execute({
                sql: `UPDATE ai_settings SET provider = ?, api_key = ?, model = ?, base_url = ?, updated_at = datetime('now') WHERE id = 1`,
                args: [provider, api_key || '', model || '', base_url || '']
            });
        }

        return NextResponse.json({ code: 200, msg: '配置保存成功' });
    } catch (error) {
        console.error('Save AI Settings Error:', error);
        return NextResponse.json({ code: 500, msg: '保存失败' });
    }
}
