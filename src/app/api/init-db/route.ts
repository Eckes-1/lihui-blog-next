
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Create Posts Table
        await db.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        excerpt TEXT,
        content TEXT,
        date TEXT,
        tags TEXT, 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Check if data exists
        const result = await db.execute("SELECT count(*) as count FROM posts");
        const count = result.rows[0].count;

        if (Number(count) === 0) {
            await db.execute({
                sql: `INSERT INTO posts (slug, title, excerpt, content, date, tags) VALUES 
              (:slug, :title, :excerpt, :content, :date, :tags)`,
                args: {
                    slug: "hello-world",
                    title: "你好，世界 (From Database)",
                    excerpt: "这是一条来自 Turso 数据库的动态内容！",
                    content: "# Hello World\n\n数据打通成功！",
                    date: "2026-02-01",
                    tags: "Hexo,Blog",
                },
            });
            return NextResponse.json({ message: "Database initialized and seeded!" });
        }

        return NextResponse.json({ message: "Database already initialized", count });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
