
const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error("❌ Missing environment variables. Please check .env.local");
    process.exit(1);
}

const db = createClient({ url, authToken });

async function setup() {
    console.log("🚀 Setting up Turso database...");

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
        tags TEXT, -- Comma separated tags for simplicity in SQLite
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("✅ Table 'posts' created.");

        // Check if data exists
        const result = await db.execute("SELECT count(*) as count FROM posts");
        const count = result.rows[0].count;

        if (count === 0) {
            console.log("📝 Seeding initial data...");

            await db.execute({
                sql: `INSERT INTO posts (slug, title, excerpt, content, date, tags) VALUES 
              (:slug, :title, :excerpt, :content, :date, :tags)`,
                args: {
                    slug: "hello-world",
                    title: "你好，世界",
                    excerpt: "欢迎来到我的全新动态博客！这是一个基于 Next.js 复刻的 Stellar 主题。",
                    content: "# Hello World\n\n这是 **Turso** 数据库驱动的第一篇文章。",
                    date: "2026-02-01",
                    tags: "Hexo,Blog",
                },
            });

            await db.execute({
                sql: `INSERT INTO posts (slug, title, excerpt, content, date, tags) VALUES 
              (:slug, :title, :excerpt, :content, :date, :tags)`,
                args: {
                    slug: "next-js-migration",
                    title: "迁移进度汇报",
                    excerpt: "全站样式已经完成了 90% 的复刻，现在数据也上云了！",
                    content: "从静态文件到 Serverless 数据库的华丽转身。",
                    date: "2026-02-01",
                    tags: "Next.js,Turso",
                },
            });

            console.log("✅ Initial posts inserted.");
        } else {
            console.log(`ℹ️ Table already has ${count} posts. Skipping seed.`);
        }

    } catch (err) {
        console.error("❌ Error setting up database:", err);
    }
}

setup();
