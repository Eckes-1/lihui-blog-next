
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import PostList from "./components/PostList";
import { db } from "@/lib/db";

// Revalidate every hour
export const revalidate = 3600;

async function getPosts() {
  try {
    const result = await db.execute("SELECT * FROM posts ORDER BY created_at DESC");
    return result.rows.map((row: any) => ({
      title: row.title,
      excerpt: row.excerpt || "",
      date: row.date || new Date(row.created_at).toISOString().split('T')[0],
      link: `/${row.slug}`,
    }));
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

export default async function Home() {
  const posts = await getPosts();
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
      </div>
    </>
  );
}
