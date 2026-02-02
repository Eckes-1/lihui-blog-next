
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function savePost(formData: FormData) {
    const slug = formData.get("slug") as string;
    const originalSlug = formData.get("originalSlug") as string; // in case slug changes
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const date = formData.get("date") as string;
    const tags = formData.get("tags") as string;
    const excerpt = formData.get("excerpt") as string || "";

    if (!slug || !title || !content) {
        throw new Error("Missing required fields");
    }

    // Check if new or update
    // If originalSlug is present, we might be updating.
    // Actually, simple UPSERT or check logic.

    // If slug changed, we need to handle that (update PK is hard in some DBs, easier to update where slug=originalSlug)
    // For simplicity, let's assume we are just UPSERTING by slug for now or INSERT OR REPLACE.

    // If originalSlug exists and is different from slug, we should delete old and insert new? Or update slug?
    // SQLite: UPDATE posts SET slug=?, ... WHERE slug=?

    try {
        if (originalSlug && originalSlug !== "new") {
            // Update existing
            await db.execute({
                sql: `UPDATE posts SET slug=?, title=?, content=?, date=?, tags=?, excerpt=? WHERE slug=?`,
                args: [slug, title, content, date, tags, excerpt, originalSlug]
            });
        } else {
            // Insert new (or overwrite if same slug users input)
            await db.execute({
                sql: `INSERT INTO posts (slug, title, content, date, tags, excerpt) VALUES (?, ?, ?, ?, ?, ?)
                 ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content=excluded.content, date=excluded.date, tags=excluded.tags, excerpt=excluded.excerpt`,
                args: [slug, title, content, date, tags, excerpt]
            });
        }
    } catch (e) {
        console.error("Save Error:", e);
        throw new Error("Failed to save post");
    }

    revalidatePath("/admin/posts");
    revalidatePath("/blog");
    revalidatePath(`/${slug}`);

    if (originalSlug === "new") {
        redirect(`/admin/editor/${slug}`);
    }
}

export async function deletePost(slug: string) {
    await db.execute({
        sql: "DELETE FROM posts WHERE slug = ?",
        args: [slug]
    });
    revalidatePath("/admin/posts");
}
