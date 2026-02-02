// Deployment Trigger: Force Rebuild 2026-02-03-1
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import PostList from "./components/PostList";
import SidebarControl from "./components/SidebarControl";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

async function getPosts() {
  try {
    const result = await db.execute("SELECT * FROM posts ORDER BY created_at DESC");
    const posts = result.rows.map((row: any) => ({
      title: row.title,
      excerpt: row.excerpt || "",
      date: row.date || new Date(row.created_at).toISOString().split('T')[0],
      link: `/${row.slug}`,
    }));
    return { posts, error: null };
  } catch (error: any) {
    console.error("Database Error:", error);
    return { posts: [], error: error.message || "Unknown database error" };
  }
}

export default async function Home() {
  const { posts, error } = await getPosts();

  if (error) {
    return (
      <div style={{ padding: 50, textAlign: "center", color: "red" }}>
        <h3>数据库连接失败</h3>
        <p>{error}</p>
        <p style={{ fontSize: "0.8em", color: "#666" }}>请检查 Vercel 环境变量设置 (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN)</p>
      </div>
    );
  }
  return (
    <>
      <div className="sitebg">
        <div className="siteblur"></div>
      </div>
      <div className="l_body index" id="start">
        <LeftSidebar />

        <div className="l_main" id="main">
          {/* Mobile Header (Hidden on Desktop) */}
          <header className="header mobile-only">
            <div className="logo-wrap">
              <a className="avatar" href="/about">
                <div className="bg" style={{ opacity: 0, backgroundImage: "url(https://gcore.jsdelivr.net/gh/cdn-x/placeholder@1.0.12/avatar/round/rainbow64@3x.webp)" }}></div>
                <img className="avatar" src="/images/avatar.jpg" alt="avatar" />
              </a>
              <a className="title" href="/">
                <div className="main">LIHUI</div>
                <div className="sub cap">分享技术与生活</div>
              </a>
            </div>
          </header>

          <div className="navbar top">
            <div className="navbar-blur">
              <div className="navbar-container">
                <nav className="post">
                  <a className="active" href="/">近期发布</a>
                  <a href="/categories/">分类</a>
                  <a href="/tags/">标签</a>
                  <a href="/archives/">归档</a>
                </nav>
              </div>
            </div>
          </div>

          <PostList posts={posts} />

          <footer className="page-footer footnote">
            <hr />
            <div className="text">
              <p>本站由 <a href="/">LIHUI</a> 使用 Next.js 重构。<br />UI 复刻自 Stellar 主题。</p>
            </div>
          </footer>
        </div>

        <RightSidebar />
        <SidebarControl />
      </div>
    </>
  );
}
