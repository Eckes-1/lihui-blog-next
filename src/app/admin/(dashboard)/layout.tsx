import "../admin.css";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminTagsView from "../components/AdminTagsView";
import AdminContentWrapper from "../components/AdminContentWrapper";
import SessionWarning from "../components/SessionWarning";
import { AdminProvider } from "../admin-context";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Fetch Admin Background Settings
    let bgUrl = '';
    let bgOpacity = 0.8;
    let contentOpacity = 0.9;
    let sidebarOpacity = 0.9;

    try {
        const rs = await db.execute({
            sql: "SELECT * FROM settings WHERE key IN ('admin_bg_url', 'admin_bg_opacity', 'admin_content_opacity', 'admin_sidebar_opacity')",
            args: []
        });

        rs.rows.forEach((r: any) => {
            if (r.key === 'admin_bg_url') bgUrl = r.value;
            if (r.key === 'admin_bg_opacity') bgOpacity = Number(r.value) / 100;
            if (r.key === 'admin_content_opacity') contentOpacity = Number(r.value) / 100;
            if (r.key === 'admin_sidebar_opacity') sidebarOpacity = Number(r.value) / 100;
        });
    } catch (e) {
        console.error("Failed to load admin settings", e);
    }

    // Helper to identify video
    const isVideo = bgUrl && /\.(mp4|webm|ogg)$/i.test(bgUrl);

    return (
        <AdminProvider user={session?.user}>
            {/* Background Layer (Fixed) */}
            {bgUrl && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
                    {isVideo ? (
                        <video
                            src={bgUrl}
                            autoPlay loop muted playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <img
                            src={bgUrl}
                            alt="Admin Background"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    )}
                    {/* Mask Layer */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: `rgba(255,255,255,${bgOpacity})`
                    }} />
                </div>
            )}

            {/* Global Styled Overrides for Transparency */}
            {bgUrl && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    :root {
                        --admin-card: rgba(255, 255, 255, ${contentOpacity}) !important;
                        --admin-sidebar-bg: rgba(255, 255, 255, ${sidebarOpacity}) !important;
                        --admin-header-bg: rgba(255, 255, 255, ${Math.max(contentOpacity, 0.95)}) !important;
                    }
                    [data-theme='dark'] {
                        --admin-card: rgba(30, 41, 59, ${contentOpacity}) !important;
                        --admin-sidebar-bg: rgba(15, 23, 42, ${sidebarOpacity}) !important;
                        --admin-header-bg: rgba(15, 23, 42, ${Math.max(contentOpacity, 0.95)}) !important;
                    }
                    /* Force .card classes to use the variable if they have hardcoded backgrounds */
                    .card, .admin-sidebar, .admin-header {
                        background: var(--admin-card) !important;
                    }
                    .admin-sidebar {
                        background: var(--admin-sidebar-bg) !important;
                    }
                    .admin-header {
                        background: var(--admin-header-bg) !important;
                    }
                `}} />
            )}

            <div className="admin-layout" style={{
                display: 'flex', height: '100vh', overflow: 'hidden',
                background: bgUrl ? 'transparent' : 'var(--admin-bg)',
                position: 'relative', zIndex: 1
            }}>
                {/* Left Sidebar */}
                <AdminSidebar />

                {/* Right Content Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

                    {/* Top Header */}
                    <AdminHeader />

                    {/* Tabs View */}
                    <AdminTagsView />

                    {/* Main Content Area */}
                    <main className="admin-main-content" style={{
                        flex: 1,
                        overflowY: 'auto',
                        position: 'relative'
                    }}>
                        <AdminContentWrapper>
                            {children}
                        </AdminContentWrapper>
                    </main>

                    {/* Session Warning */}
                    <SessionWarning />
                </div>
            </div>
        </AdminProvider>
    );
}
