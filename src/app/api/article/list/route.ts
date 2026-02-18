
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const keyword = searchParams.get('keyword') || '';
    const offset = (page - 1) * pageSize;

    try {
        let countSql = 'SELECT COUNT(*) as total FROM posts';
        let querySql = 'SELECT * FROM posts';
        const args: any[] = [];
        const countArgs: any[] = [];

        if (keyword) {
            const filter = `%${keyword}%`;
            countSql += ' WHERE title LIKE ? OR tags LIKE ?';
            querySql += ' WHERE title LIKE ? OR tags LIKE ?';
            args.push(filter, filter);
            countArgs.push(filter, filter);
        }

        querySql += ' ORDER BY date DESC LIMIT ? OFFSET ?';
        // Add pagination args
        args.push(pageSize, offset);

        // Get total count
        const countResult = await db.execute({
            sql: countSql,
            args: countArgs
        });
        const total = countResult.rows[0].total as number;

        // Get paginated posts
        const result = await db.execute({
            sql: querySql,
            args: args
        });

        const list = result.rows.map(row => ({
            id: row.slug,
            title: row.title,
            slug: row.slug,
            date: row.date,
            tags: row.tags,
            excerpt: row.excerpt,
            status: 1
        }));

        return NextResponse.json({
            code: 200,
            msg: 'success',
            data: {
                list,
                total,
                page,
                pageSize
            }
        });

    } catch (error) {
        console.error('Fetch Articles Error:', error);
        return NextResponse.json({
            code: 500,
            msg: 'Failed to fetch articles',
            data: null
        });
    }
}
