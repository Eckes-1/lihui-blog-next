
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    try {
        const { slug, title, content, date, tags, excerpt } = await request.json();

        if (!slug || !title) {
            return NextResponse.json({ code: 400, msg: 'Slug and Title are required' });
        }

        // Upsert logic: If slug exists, update; else insert
        await db.execute({
            sql: `INSERT INTO posts (slug, title, content, date, tags, excerpt) VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT(slug) DO UPDATE SET 
                title=excluded.title, 
                content=excluded.content, 
                date=excluded.date, 
                tags=excluded.tags, 
                excerpt=excluded.excerpt`,
            args: [slug, title, content, date, tags, excerpt]
        });

        revalidatePath("/blog");
        revalidatePath("/admin/posts");

        return NextResponse.json({
            code: 200,
            msg: 'Post saved successfully',
            data: { slug }
        });

    } catch (error) {
        console.error('Save Article Error:', error);
        return NextResponse.json({
            code: 500,
            msg: 'Failed to save article',
            data: null
        });
    }
}
