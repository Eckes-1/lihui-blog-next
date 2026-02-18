
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ code: 400, msg: 'Missing slug' });
    }

    try {
        await db.execute({
            sql: "DELETE FROM posts WHERE slug = ?",
            args: [slug]
        });

        revalidatePath("/blog");
        revalidatePath("/admin/posts");

        return NextResponse.json({ code: 200, msg: 'Deleted successfully' });
    } catch (e) {
        console.error('Delete Article Error:', e);
        return NextResponse.json({ code: 500, msg: 'Delete failed' });
    }
}
