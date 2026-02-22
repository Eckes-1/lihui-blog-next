
"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, Maximize, Minimize, RefreshCw, ChevronRight, Home, PanelLeftClose, PanelLeftOpen, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useAdmin } from "../admin-context";
import { useState, useEffect, useRef } from "react";
import { logoutAction } from "../actions";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const { isCollapsed, toggleSidebar, user, refreshContent } = useAdmin();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Toggle Fullscreen with Cross-Browser Support
    const toggleFullscreen = () => {
        const doc = document as any;
        const root = document.documentElement as any;

        if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            if (root.requestFullscreen) {
                root.requestFullscreen();
            } else if (root.mozRequestFullScreen) { // Firefox
                root.mozRequestFullScreen();
            } else if (root.webkitRequestFullscreen) { // Chrome, Safari and Opera
                root.webkitRequestFullscreen();
            } else if (root.msRequestFullscreen) { // IE/Edge
                root.msRequestFullscreen();
            }
        } else {
            if (doc.exitFullscreen) {
                doc.exitFullscreen();
            } else if (doc.mozCancelFullScreen) {
                doc.mozCancelFullScreen();
            } else if (doc.webkitExitFullscreen) {
                doc.webkitExitFullscreen();
            } else if (doc.msExitFullscreen) {
                doc.msExitFullscreen();
            }
        }
    };

    // Fullscreen Listener with Cross-Browser Support
    useEffect(() => {
        const onFullscreenChange = () => {
            const doc = document as any;
            const isFull = doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
            setIsFullscreen(!!isFull);
        };

        document.addEventListener("fullscreenchange", onFullscreenChange);
        document.addEventListener("webkitfullscreenchange", onFullscreenChange);
        document.addEventListener("mozfullscreenchange", onFullscreenChange);
        document.addEventListener("MSFullscreenChange", onFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", onFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
            document.removeEventListener("mozfullscreenchange", onFullscreenChange);
            document.removeEventListener("MSFullscreenChange", onFullscreenChange);
        };
    }, []);

    // Outside Click for User Menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        refreshContent();
        router.refresh();
        setTimeout(() => {
            setIsRefreshing(false);
        }, 800);
    };

    // Breadcrumbs Logic
    const generateBreadcrumbs = () => {
        const paths = pathname.split('/').filter(p => p);
        const breadcrumbs: { name: string; href: string }[] = [];
        const hiddenSegments = ['ai', 'system'];

        paths.forEach((segment, index) => {
            const href = `/${paths.slice(0, index + 1).join('/')}`;
            if (segment === 'admin') return;
            if (hiddenSegments.includes(segment)) return;

            const nameMap: Record<string, string> = {
                posts: "文章管理",
                create: "撰写文章",
                configs: "API 配置",
                settings: "设置",
                editor: "编辑器",
                tags: "标签管理",
                categories: "分类管理",
                users: "用户管理",
                comments: "评论管理",
                links: "友链管理"
            };

            let name = nameMap[segment] || segment;
            if (segment === 'settings' && paths.includes('ai')) {
                name = "AI 设置";
            }

            breadcrumbs.push({ name, href });
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    return (
        <header className="admin-header">
            {/* Left: Toggle & Breadcrumbs */}
            <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={toggleSidebar}
                    className="icon-btn"
                    title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
                    style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                </button>

                {/* Desktop Breadcrumbs */}
                <div className="breadcrumbs desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--admin-text-sub)' }}>
                    <Link href="/admin" className="home-link" title="控制台" style={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
                        <Home size={18} />
                    </Link>

                    {breadcrumbs.length > 0 && <ChevronRight size={14} className="separator" style={{ opacity: 0.5 }} />}

                    {breadcrumbs.map((item, index) => (
                        <div key={item.href} className="breadcrumb-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {index > 0 && <ChevronRight size={14} className="separator" style={{ opacity: 0.5 }} />}
                            {index === breadcrumbs.length - 1 ? (
                                <span className="current" style={{ color: 'var(--admin-text-main)', fontWeight: 500 }}>{item.name}</span>
                            ) : (
                                <Link href={item.href} className="link" style={{ color: 'inherit', textDecoration: 'none' }}>{item.name}</Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Actions */}
            <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Search Bar - Desktop Input / Mobile Icon */}
                <div className="search-wrap desktop-only" style={{ position: 'relative' }}>
                    <Search size={16} className="search-icon" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-sub)' }} />
                    <input
                        type="text"
                        placeholder="搜索..."
                        className="search-input"
                        style={{
                            padding: '8px 12px 8px 36px',
                            borderRadius: '8px',
                            border: '1px solid var(--admin-border)',
                            background: 'var(--admin-hover)',
                            outline: 'none',
                            fontSize: '0.9rem',
                            width: '200px'
                        }}
                    />
                </div>

                <button className={`icon-btn ${isRefreshing ? 'spin' : ''}`} title="刷新" onClick={handleRefresh} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--admin-text-main)' }}>
                    <RefreshCw size={20} />
                </button>

                <button className="icon-btn desktop-only" title="全屏" onClick={toggleFullscreen} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--admin-text-main)' }}>
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>

                <button className="icon-btn desktop-only" title="通知" style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--admin-text-main)' }}>
                    <div style={{ position: "relative" }}>
                        <Bell size={20} />
                        <span className="badge" style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: 'red', borderRadius: '50%' }} />
                    </div>
                </button>

                {/* User Dropdown */}
                <div style={{ position: "relative" }} ref={userMenuRef}>
                    <motion.div
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        style={{ cursor: "pointer", marginLeft: "8px" }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {/* Avatar with Enhanced Styles */}
                        <div style={{
                            width: "36px", height: "36px", borderRadius: "50%",
                            background: user?.image ? "#e2e8f0" : "linear-gradient(135deg, var(--admin-primary) 0%, #3b82f6 100%)",
                            border: "2px solid rgba(255,255,255,0.8)",
                            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.25)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontWeight: 700, fontSize: "15px",
                            overflow: "hidden"
                        }}>
                            {user?.image ? (
                                <img src={user.image} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : "B"}
                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {isUserMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.92, transformOrigin: "top right" }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.92 }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                style={{
                                    position: "absolute",
                                    top: "50px",
                                    right: 0,
                                    width: "180px",
                                    background: "rgba(255, 255, 255, 0.95)",
                                    backdropFilter: "blur(12px)",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(0,0,0,0.06)",
                                    boxShadow: "0 10px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.02)",
                                    padding: "8px",
                                    zIndex: 100,
                                    overflow: "hidden"
                                }}
                            >
                                <div style={{
                                    padding: "8px 12px",
                                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                                    marginBottom: "4px",
                                    fontSize: "13px",
                                    color: "#64748b"
                                }}>
                                    <div style={{ fontWeight: 600, color: "#1e293b" }}>{user?.name || "管理员"}</div>
                                    <div style={{ fontSize: "12px", opacity: 0.8 }}>{user?.email || "admin@example.com"}</div>
                                </div>

                                <Link href="/admin/profile" className="menu-item">
                                    <User size={16} /> <span>个人中心</span>
                                </Link>
                                <Link href="/admin/settings" className="menu-item">
                                    <Settings size={16} /> <span>个人设置</span>
                                </Link>
                                <div className="divider"></div>
                                <form action={logoutAction}>
                                    <button className="menu-item logout">
                                        <LogOut size={16} /> <span>退出登录</span>
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style jsx>{`
                .admin-header {
                    height: 64px;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 20px;
                    z-index: 10;
                    flex-shrink: 0;
                    transition: all 0.2s;
                    position: Sticky; top: 0;
                }
                
                .header-left, .header-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                /* Mobile Adaptations */
                @media (max-width: 768px) {
                    .desktop-only { display: none !important; }
                    .mobile-only { display: flex !important; align-items: center; justify-content: center; }
                    .admin-header { padding: 0 12px; height: 60px; }
                }
                
                @media (min-width: 769px) {
                    .mobile-only { display: none !important; }
                }

                /* Buttons */
                .icon-btn {
                    width: 40px; height: 40px;
                    border-radius: 12px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #64748b;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }
                .icon-btn:hover {
                    background: rgba(0,0,0,0.04);
                    color: var(--admin-primary);
                    transform: translateY(-1px);
                }
                .icon-btn:active {
                    transform: scale(0.96);
                }
                .icon-btn.spin { animation: spin 0.8s linear infinite; pointer-events: none; color: var(--admin-primary); }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                /* Breadcrumbs */
                .breadcrumbs {
                    display: flex; align-items: center; gap: 8px; font-size: 14px; color: #64748b;
                    margin-left: 12px;
                }
                .home-link { 
                    display: flex; align-items: center; color: inherit; text-decoration: none; 
                    padding: 6px; border-radius: 6px; transition: background 0.2s;
                }
                .home-link:hover { background: rgba(0,0,0,0.04); color: var(--admin-primary); }
                .separator { opacity: 0.4; margin: 0 2px; }
                .breadcrumb-item { display: flex; align-items: center; gap: 8px; }
                .current { color: #0f172a; fontWeight: 600; white-space: nowrap; }
                .link { 
                    color: inherit; text-decoration: none; white-space: nowrap; transition: color 0.2s;
                    position: relative; 
                }
                .link:hover { color: var(--admin-primary); }

                /* Search */
                .search-wrap { position: relative; margin-right: 12px; }
                .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; transition: color 0.2s; }
                .search-input {
                    padding: 9px 12px 9px 40px; 
                    border-radius: 10px; 
                    border: 1px solid transparent;
                    background: #f1f5f9; 
                    font-size: 13px; width: 220px; outline: none; color: #1e293b;
                    transition: all 0.2s;
                }
                .search-input:focus { 
                    border-color: var(--admin-primary); 
                    background: white; 
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08); 
                }
                .search-input:hover { background: #e2e8f0; }
                .search-input:focus:hover { background: white; }

                .badge { 
                    position: absolute; top: 10px; right: 10px; width: 8px; height: 8px; 
                    background: #ef4444; border-radius: 50%; border: 2px solid white; 
                    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
                }

                /* Dropdown Menu Items */
                :global(.menu-item) {
                    display: flex; align-items: center; gap: 10px; padding: 10px 12px; 
                    border-radius: 8px; text-decoration: none; color: #334155; 
                    font-size: 14px; transition: all 0.2s; cursor: pointer;
                    margin-bottom: 2px;
                }
                :global(.menu-item:hover) { 
                    background: #f8fafc; 
                    color: var(--admin-primary); 
                    transform: translateX(2px);
                }
                .divider { height: 1px; background: rgba(0,0,0,0.05); margin: 6px 0; }
                .logout { width: 100%; border: none; background: transparent; color: #ef4444; }
                .logout:hover { background: #fef2f2; color: #dc2626; }
            `}</style>
        </header>
    );
}
