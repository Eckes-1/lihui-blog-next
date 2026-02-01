
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const slug = "exploring-stellar-theme";
        const title = "深入探索 Stellar 主题：功能与美学的完美融合";
        const content = `
欢迎来到这篇演示文章！本文旨在展示 **Stellar** 主题在 Next.js 复刻版中的完美表现。我们将测试各种 Markdown 元素，包括长文本、代码块、列表以及图片。

## 1. 什么是 Stellar？

Stellar 是一个为 Hexo 设计的博客主题，以其**卡片式设计**、**动态交互**和**极简美学**而闻名。我们现在不仅把它搬到了 Next.js，还保持了原汁原味的体验。

![风景图](https://images.unsplash.com/photo-1497436072909-60f360e1d4b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80)

> "设计不仅仅是外观和感觉，设计就是它是如何工作的。" —— 史蒂夫·乔布斯

## 2. 文本排版测试

这里是一段较长的文本，用来测试排版效果。在一个优秀的博客主题中，正文的字体大小、行高（Line Height）以及字间距都至关重要。Stellar 主题采用了精心挑选的字体栈，确保在 Windows、macOS 和移动设备上都能获得最佳的阅读体验。

### 列表展示

无序列表：
- ✅ **响应式设计**：完美适配手机、平板和桌面端。
- ✅ **深色模式**：自动跟随系统或手动切换，保护视力。
- ✅ **动态目录**：右侧悬浮目录，支持平滑滚动。

有序列表：
1. 第一步：初始化 Next.js 项目。
2. 第二步：配置 Tailwind CSS 或 CSS Modules。
3. 第三步：复刻 Stellar 的核心样式文件。
4. 第四步：接入 Turso 数据库实现动态内容。

## 3. 代码高亮测试

作为一个技术博客，代码块的渲染必须漂亮。以下是一个 Python 代码示例：

\`\`\`python
def hello_stellar():
    features = ["Beautiful", "Fast", "Responsive"]
    print("Welcome to Stellar Theme!")
    for feature in features:
        print(f"- {feature}")

if __name__ == "__main__":
    hello_stellar()
\`\`\`

以及一段 JavaScript (React) 代码：

\`\`\`tsx
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count is {count}
    </button>
  );
}
\`\`\`

## 4. 图文混排

图片是博客的灵魂。下面是一张来自 Unsplash 的精美图片：

![城市夜景](https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80)

*图注：繁华的城市夜景，展示了现代文明的活力。*

## 5. 表格测试

| 特性 | Hexo 原版 | Next.js 复刻版 |
| :--- | :---: | :---: |
| 渲染方式 | 静态生成 (SSG) | 动态渲染 (SSR/ISR) |
| 数据库 | 无 (JSON/Markdown) | Turso (SQLite) |
| 部署平台 | GitHub Pages | Vercel |
| 交互体验 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 结语

通过这篇文章，您可以看到我们成功复刻了 Stellar 主题的所有核心特性。无论是排版、配色还是交互，都力求做到像素级的还原。接下来，我们将继续完善评论系统和后台管理功能。

感谢您的阅读！🚀
`;
        const date = new Date().toISOString().split('T')[0];
        const tags = "Stellar,Next.js,测试";

        await db.execute({
            sql: `INSERT INTO posts (slug, title, content, date, tags) VALUES (?, ?, ?, ?, ?) 
            ON CONFLICT(slug) DO UPDATE SET content = excluded.content, title = excluded.title, date = excluded.date, tags = excluded.tags`,
            args: [slug, title, content, date, tags],
        });

        return NextResponse.json({ success: true, message: "Demo post added successfully", slug });
    } catch (error) {
        console.error("Error adding post:", error);
        return NextResponse.json({ success: false, error: "Failed to add post" }, { status: 500 });
    }
}
