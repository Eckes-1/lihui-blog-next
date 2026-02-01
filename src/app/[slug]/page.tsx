
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
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

    return (
        <>
            <div className="sitebg">
                <div className="siteblur"></div>
            </div>
            <div className="l_body">
                <LeftSidebar />

                <div className="l_main">
                    <article className="post-card post">
                        <div className="md-text">
                            <h1 className="post-title">{post.title}</h1>
                            <div className="meta cap">
                                <span className="cap" id="post-meta">
                                    <svg style={{ marginBottom: "2px" }} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M6.94 2c.416 0 .753.324.753.724v1.46c.668-.012 1.417-.012 2.26-.012h4.015c.842 0 1.591 0 2.259.013v-1.46c0-.4.337-.725.753-.725s.753.324.753.724V4.25c1.445.111 2.394.384 3.09 1.055c.698.67.982 1.582 1.097 2.972L22 9H2v-.724c.116-1.39.4-2.302 1.097-2.972c.697-.67 1.645-.944 3.09-1.055V2.724c0-.4.337-.724.753-.724" /><path fill="currentColor" d="M22 14v-2c0-.839-.004-2.335-.017-3H2.01c-.013.665-.01 2.161-.01 3v2c0 3.771 0 5.657 1.172 6.828C4.343 22 6.228 22 10 22h4c3.77 0 5.656 0 6.828-1.172C22 19.658 22 17.772 22 14" opacity=".5" /><path fill="currentColor" d="M18 17a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0" /></svg>
                                    <time>{post.date}</time>
                                </span>
                                {post.tags.length > 0 && (
                                    <span className="cap">
                                        <svg style={{ marginBottom: "2px" }} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M2 6.95c0-.883 0-1.324.07-1.692A4 4 0 0 1 5.257 2.07C5.626 2 6.068 2 6.95 2c.386 0 .58 0 .766.017a4 4 0 0 1 2.18.904c.144.119.28.255.554.529L11 4c.816.816 1.224 1.224 1.712 1.495a4 4 0 0 0 .848.352C14.098 6 14.675 6 15.828 6h.374c2.632 0 3.949 0 4.804.77c.079.07.154.145.224.224c.77.855.77 2.172.77 4.804V14c0 3.771 0 5.657-1.172 6.828C19.657 22 17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.172C2 19.657 2 17.771 2 14z" opacity=".5" /><path fill="currentColor" d="M20 6.238c0-.298-.005-.475-.025-.63a3 3 0 0 0-2.583-2.582C17.197 3 16.965 3 16.5 3H9.988c.116.104.247.234.462.45L11 4c.816.816 1.224 1.224 1.712 1.495a4 4 0 0 0 .849.352C14.098 6 14.675 6 15.829 6h.373c1.78 0 2.957 0 3.798.238" /><path fill="currentColor" fillRule="evenodd" d="M12.25 10a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75" clipRule="evenodd" /></svg>
                                        {post.tags.map((tag, i) => (
                                            <span key={i} style={{ marginRight: 5 }}>{tag}</span>
                                        ))}
                                    </span>
                                )}
                            </div>

                            <div className="divider"></div>

                            <div className="content">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                                >
                                    {post.content}
                                </ReactMarkdown>
                            </div>

                        </div>
                    </article>

                    <footer className="page-footer footnote">
                        <hr />
                        <div className="text">
                            <p><Link href="/">← 返回首页</Link></p>
                        </div>
                    </footer>
                </div>

                <RightSidebar />
            </div>
        </>
    );
}
