
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const rs = await db.execute({
            sql: "SELECT key, value FROM settings WHERE key IN ('login_bg_url', 'login_bg_opacity')",
            args: []
        });

        const config: any = {};
        rs.rows.forEach(row => {
            config[row.key as string] = row.value;
        });

        return NextResponse.json(config);
    } catch (error) {
        console.error("Config fetch error:", error);
        return NextResponse.json({ login_bg_url: '' });
    }
}
