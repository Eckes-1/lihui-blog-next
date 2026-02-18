
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { key, value } = await req.json();

        if (!key) {
            return NextResponse.json({ error: "Key is required" }, { status: 400 });
        }

        await db.execute({
            sql: "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            args: [key, value]
        });

        return NextResponse.json({ success: true, key, value });
    } catch (error: any) {
        console.error("Settings update error:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}

export async function GET() {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const rs = await db.execute("SELECT * FROM settings");
        const settings: Record<string, string> = {};
        rs.rows.forEach(r => {
            settings[r.key as string] = r.value as string;
        });

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}
