
const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error("❌ Missing environment variables. Please check .env.local");
    process.exit(1);
}

const db = createClient({ url, authToken });

async function seedFeatures() {
    console.log("🚀 Seeding feature test post...");

    try {
        const slug = "stellar-features-test";
        const title = "Stellar 主题特性完整测试";
        const excerpt = "测试所有高级特性：提示块、时间轴、标签插件等。";
        const content = `
本文用于测试 **Next.js 复刻版 Stellar** 的高级特性。这些特性通过自定义的 Markdown 语法实现，致力于 1:1 还原 Hexo 版体验。

## 1. 提示块 (Note)

Stellar 最标志性的功能就是各种颜色的提示块。

{% note info 提示信息 %}
这是一个普通的提示块 (Info)。
支持 **Markdown** 语法。
{% endnote %}

{% note warning 注意事项 %}
这是一个警告块 (Warning)。
请务必注意身边的安全。
{% endnote %}

{% note success 恭喜 %}
这是一个成功块 (Success)。
操作执行成功！
{% endnote %}

{% note error 错误 %}
这是一个错误块 (Error)。
严禁进行此类操作。
{% endnote %}

## 2. 时间轴 (Timeline)

{% timeline %}
- **2026-02-01** 项目启动
  初始化 Next.js 15+ 项目，配置 Tailwind CSS。
- **2026-02-02** 核心功能完成
  完成文章列表、详情页、TOC 目录复刻。
- **2026-02-03** 高级组件支持
  实现 Note 和 Timeline 组件。
{% endtimeline %}

## 3. 按钮 (Button) [待实现]

虽然目前可能只支持标准 Markdown，但我们会逐步加入更多组件。

## 4. 代码块增强

\`\`\`javascript
console.log("Hello Stellar Directives!");
\`\`\`

> 引用块测试：
> "Stay hungry, stay foolish."

感谢阅读测试！
`;
        const date = new Date().toISOString().split('T')[0];
        const tags = "Stellar,Test,Features";

        await db.execute({
            sql: `INSERT INTO posts (slug, title, excerpt, content, date, tags) VALUES (?, ?, ?, ?, ?, ?) 
            ON CONFLICT(slug) DO UPDATE SET content = excluded.content, title = excluded.title, excerpt = excluded.excerpt, date = excluded.date, tags = excluded.tags`,
            args: [slug, title, excerpt, content, date, tags],
        });

        console.log("✅ Feature test post inserted successfully!");

    } catch (err) {
        console.error("❌ Error seeding feature post:", err);
    }
}

seedFeatures();
