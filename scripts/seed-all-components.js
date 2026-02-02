
const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error("❌ Missing environment variables. Please check .env.local");
    process.exit(1);
}

const db = createClient({ url, authToken });

async function seedAllComponents() {
    console.log("🚀 Seeding ALL components test post...");

    try {
        const slug = "stellar-all-components-showcase";
        const title = "Stellar 全组件复刻展示";
        const excerpt = "展示所有已复刻的 Stellar 主题组件：提示块、时间轴、网格、折叠、选项卡、链接、按钮、关于、友链。";
        const content = `
本文旨在集中展示 **Next.js 版 Stellar** 目前已复刻的所有组件效果。

## 1. Note (提示块)

{% note info Info 提示块 %}
普通信息提示块。
{% endnote %}

{% note warning Warning 警告块 %}
操作需谨慎！
{% endnote %}

{% note success Success 成功块 %}
恭喜，操作成功完成。
{% endnote %}

{% note error Error 错误块 %}
发生了一个严重的错误。
{% endnote %}

{% note purple 自定义颜色 (Purple) %}
这是一个紫色的提示块。
{% endnote %}

## 2. Timeline (时间轴)

{% timeline %}
- **2026-01-01** 项目立项
  确定使用 Next.js 重构博客。
- **2026-01-15** 基础建设
  完成路由 setup 和数据库连接。
- **2026-02-02** 组件复刻
  Note, Timeline, Grid 等组件复刻完成。
{% endtimeline %}

## 3. Grid (网格布局)

{% grid bg:card w:200px gap:16px %}
<!-- cell -->
**网格项 1**
内容文本
<!-- cell -->
**网格项 2**
更多内容
<!-- cell -->
**网格项 3**
{% note info %}
甚至可以放 Note
{% endnote %}
{% endgrid %}

## 4. Folding (折叠块)

{% folding color:blue 默认折叠 %}
这里是隐藏的内容。
点击展开查看更多。
{% endfolding %}

{% folding color:green open:true 默认展开 %}
这个卡片默认是展开的。
{% endfolding %}

## 5. Tabs (选项卡)

{% tabs %}
<!-- tab JavaScript -->
\`\`\`javascript
console.log('Hello World');
\`\`\`
<!-- tab Python -->
\`\`\`python
print("Hello World")
\`\`\`
<!-- tab Text -->
这是一段普通的文本内容。
{% endtabs %}

## 6. Link (链接卡片)

**普通卡片：**
{% link https://nextjs.org/ title:Next.js官网 %}

**富文本卡片 (带图标和描述)：**
{% link https://github.com/ desc:全球最大的代码托管平台 icon:https://github.githubassets.com/favicons/favicon.png %}

## 7. Button (按钮)

{% button color:blue 开始使用 / %} 
{% button color:red 警告按钮 # warning %}
{% button size:xs 小按钮 # %} 
{% button size:lg 大按钮 # %}

## 8. About (关于卡片)

{% about avatar:https://github.githubassets.com/favicons/favicon.png height:80px border:50% %}
**Stellar Theme**
这是一个基于 Next.js 复刻的 Stellar 主题。
追求像素级的完美还原。
{% endabout %}

## 9. Friends (友链)

{% friends %}

---
感谢观看！
`;
        const date = new Date().toISOString().split('T')[0];
        const tags = "Stellar,Showcase,Components";

        await db.execute({
            sql: `INSERT INTO posts (slug, title, excerpt, content, date, tags) VALUES (?, ?, ?, ?, ?, ?) 
            ON CONFLICT(slug) DO UPDATE SET content = excluded.content, title = excluded.title, excerpt = excluded.excerpt, date = excluded.date, tags = excluded.tags`,
            args: [slug, title, excerpt, content, date, tags],
        });

        console.log("✅ All components showcase post inserted successfully!");

    } catch (err) {
        console.error("❌ Error seeding post:", err);
    }
}

seedAllComponents();
