
import Link from "next/link";
import { LayoutDashboard, FileText, Settings, LogOut } from "lucide-react";
import "./admin.css";
import { auth, signOut } from "@/auth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Note: Middleware usually handles protection, but we can double check here or just render.

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <h2>Blog Admin</h2>
                <nav style={{ flex: 1 }}>
                    <Link href="/admin" className="nav-item">
                        <LayoutDashboard /> Dashboard
                    </Link>
                    <Link href="/admin/posts" className="nav-item">
                        <FileText /> Posts
                    </Link>
                    <Link href="/admin/settings" className="nav-item">
                        <Settings /> Settings
                    </Link>
                </nav>

                <form action={async () => {
                    "use server"
                    await signOut();
                }}>
                    <button className="nav-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <LogOut /> Sign Out
                    </button>
                </form>
            </aside>
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}
