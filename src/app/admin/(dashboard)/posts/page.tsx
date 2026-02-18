
import { db } from "@/lib/db";
import Link from "next/link";
import { Edit, Trash2, Plus } from "lucide-react";

export default async function AdminPostsPage() {
    const { rows } = await db.execute("SELECT slug, title, date, tags FROM posts ORDER BY date DESC");

    return (
        <div>
            <div className="admin-header">
                <h1>所有文章</h1>
                <Link href="/admin/posts/new" className="btn-primary">
                    <Plus size={18} /> 新建文章
                </Link>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>标题</th>
                        <th>发布日期</th>
                        <th>标签</th>
                        <th style={{ width: '100px' }}>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((post: any) => (
                        <tr key={post.slug}>
                            <td>
                                <div style={{ fontWeight: '500' }}>{post.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-p3)' }}>{post.slug}</div>
                            </td>
                            <td>{post.date}</td>
                            <td>
                                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                    {post.tags?.split(',').map((t: string) => (
                                        <span key={t} style={{ fontSize: '0.75rem', background: 'var(--theme-sub-bg)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                            {t.trim()}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Link href={`/admin/editor/${post.slug}`} className="nav-item" style={{ padding: '0.4rem' }}>
                                        <Edit size={16} />
                                    </Link>
                                    {/* Delete would need a client component or server action form */}
                                    <button className="nav-item" style={{ padding: '0.4rem', color: 'var(--text-error)', border: 'none', background: 'none', cursor: 'pointer' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
