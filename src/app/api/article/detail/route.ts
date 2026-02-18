
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ code: 400, msg: 'Missing slug' });
    }

    try {
        const result = await db.execute({
            sql: "SELECT * FROM posts WHERE slug = ?",
            args: [slug]
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ code: 404, msg: 'Article not found' });
        }

        const row = result.rows[0];
        const data = {
            title: row.title,
            slug: row.slug,
            content: row.content,
            date: row.date,
            tags: row.tags,
            excerpt: row.excerpt
        };

        return NextResponse.json({ code: 200, msg: 'success', data });
    } catch (e) {
        console.error('Get Article Error:', e);
        return NextResponse.json({ code: 500, msg: 'Internal Error' });
    }
}
