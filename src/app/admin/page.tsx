
import { db } from "@/lib/db";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";

export default async function AdminDashboard() {
    let postCount = 0;
    try {
        const res = await db.execute("SELECT COUNT(*) as c FROM posts");
        // @ts-ignore
        postCount = res.rows[0]?.c || 0;
    } catch (e) {
        console.error(e);
    }

    return (
        <div>
            <div className="admin-header">
                <h1>Dashboard</h1>
                <Link href="/admin/posts/new" className="btn-primary">
                    <Plus size={18} /> New Post
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--theme-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ background: 'var(--theme-sub-bg)', padding: '0.75rem', borderRadius: '50%' }}>
                            <FileText className="text-blue-500" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-p2)' }}>Total Posts</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{postCount}</div>
                        </div>
                    </div>
                </div>

                {/* Placeholder for other stats */}
            </div>
        </div>
    );
}
