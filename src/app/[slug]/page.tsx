
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import SidebarControl from "../components/SidebarControl";
import TOC from "../components/TOC";
import Link from "next/link";
import "../stellar.css"; // Ensure styles are applied

// Force dynamic rendering to ensure DB content is fresh
export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
    try {
        const result = await db.execute({
            sql: "SELECT * FROM posts WHERE slug = ?",
            args: [slug]
        });

        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return {
            title: row.title as string,
            content: row.content as string,
            date: (row.date as string) || new Date(row.created_at as string).toISOString().split('T')[0],
            tags: (row.tags as string)?.split(',') || [],
        };
    } catch (error) {
        console.error("Fetch Error:", error);
        return null;
    }
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) return { title: "文章未找到" };
    return {
        title: `${post.title} - LIHUI`,
        description: post.content.slice(0, 100)
    };
}

export default async function PostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    // Generate TOC data
    const slugger = new GithubSlugger();
    const headings: { text: string; level: number; id: string }[] = [];

    // Simple regex to extract headings from markdown
    const lines = post.content.split('\n');
    let inCodeBlock = false;

    lines.forEach(line => {
        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            return;
        }
        if (inCodeBlock) return;

        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const text = match[2].replace(/<[^>]*>/g, '').trim(); // Strip HTML tags if any
            const id = slugger.slug(text);
            headings.push({ text, level, id });
        }
    });

    return (
        <>
            <div className="sitebg">
                <div className="siteblur"></div>
            </div>
            <div className="l_body">
                <LeftSidebar />

                <div className="l_main" id="main">
                    <div className="article banner top">
                        <div className="content">
                            <div className="top bread-nav footnote">
                                <div className="left">
                                    <div className="flex-row" id="breadcrumb">
                                        <Link className="cap breadcrumb" href="/">主页</Link>
                                        <span className="sep"></span>
                                        <Link className="cap breadcrumb" href="/">文章</Link>
                                        {post.tags.length > 0 && (
                                            <>
                                                <span className="sep"></span>
                                                <span className="cap breadcrumb">{post.tags[0]}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex-row" id="post-meta">
                                        <span className="text created">发布于：<time dateTime={post.date}>{post.date}</time></span>
                                    </div>
                                </div>
                            </div>

                            <div className="bottom only-title">
                                <div className="text-area">
                                    <h1 className="text title"><span>{post.title}</span></h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    <article className="md-text content">
                        <div className="content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeSlug]}
                            >
                                {post.content}
                            </ReactMarkdown>
                        </div>
                    </article>

                    <div className="article-footer">
                        <section id="license">
                            <div className="header"><span>许可协议</span></div>
                            <div className="body">
                                <p>本文采用 <a target="_blank" rel="noopener" href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a> 许可协议，转载请注明出处。</p>
                            </div>
                        </section>
                    </div>
                </div>

                <RightSidebar>
                    <TOC headings={headings} />
                </RightSidebar>
                <SidebarControl />
            </div>
        </>
    );
}
