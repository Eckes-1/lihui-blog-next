
import { db } from "@/lib/db";
import EditorClient from "./editor-client";

export default async function EditorPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    let post = null;
    if (slug !== 'new') {
        try {
            const res = await db.execute({
                sql: "SELECT * FROM posts WHERE slug = ?",
                args: [slug]
            });
            post = res.rows[0] || null;
        } catch (e) {
            console.error("Error fetching post:", e);
        }
    }

    // @ts-ignore
    return <EditorClient post={post} />;
}
