
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Settings, Key, Settings2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "../admin-context";
import { useEffect, useState } from "react";

export default function AdminSidebar() {
    const { isCollapsed, toggleSidebar } = useAdmin();
    const pathname = usePathname();
    const [isMobile, setIsMobile] = useState(false);

    // Detect Mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Auto-close on mobile when route changes
    useEffect(() => {
        if (isMobile && !isCollapsed) {
            toggleSidebar();
        }
    }, [pathname, isMobile]);

    const menuItems = [
        { href: "/admin", icon: LayoutDashboard, label: "仪表盘" },
        { href: "/admin/posts", icon: FileText, label: "文章管理" },
        { href: "/admin/ai/configs", icon: Key, label: "API 配置" },
        { href: "/admin/ai/settings", icon: Settings2, label: "AI 设置" },
        { href: "/admin/settings", icon: Settings, label: "设置" },
    ];

    // Variants for Desktop
    const desktopVariants = {
        expanded: { width: 200 },
        collapsed: { width: 48 }
    };

    // Variants for Mobile (Slide Over)
    const mobileVariants = {
        expanded: { x: 0, width: 240, position: "fixed" as any },
        collapsed: { x: "-100%", width: 240, position: "fixed" as any }
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobile && !isCollapsed && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    onClick={toggleSidebar}
                    style={{
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 40
                    }}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                className="admin-sidebar"
                initial={isMobile ? "collapsed" : "expanded"}
                animate={isCollapsed ? "collapsed" : "expanded"}
                variants={isMobile ? mobileVariants : desktopVariants}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRight: isMobile ? "none" : "1px solid var(--admin-border)",
                    background: isMobile ? "#ffffff" : "var(--admin-sidebar-bg)",
                    zIndex: 50,
                    // Mobile specific styles
                    ...(isMobile ? {
                        top: 0,
                        left: 0,
                        height: "100vh",
                        boxShadow: !isCollapsed ? "4px 0 24px rgba(0,0,0,0.15)" : "none"
                    } : {})
                }}
            >
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    width: "100%"
                }}>
                    {/* Header Logo Area */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "0 20px",
                        height: "64px",
                        justifyContent: isCollapsed && !isMobile ? "center" : "space-between",
                        borderBottom: isMobile ? "1px solid var(--admin-border)" : "none"
                    }}>
                        <AnimatePresence mode="wait">
                            {(!isCollapsed || isMobile) ? (
                                <motion.div
                                    key="full-title"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}
                                >
                                    <div style={{
                                        width: "32px", height: "32px",
                                        background: "var(--admin-primary)",
                                        borderRadius: "8px",
                                        color: "white",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontWeight: "bold", fontSize: "18px"
                                    }}>B</div>
                                    <h2 style={{
                                        margin: 0, fontSize: "18px", fontWeight: 700,
                                        color: "var(--admin-text-main)", whiteSpace: "nowrap"
                                    }}>
                                        博客后台
                                    </h2>

                                    {isMobile && (
                                        <button
                                            onClick={toggleSidebar}
                                            style={{
                                                marginLeft: "auto", background: "transparent", border: "none",
                                                color: "var(--admin-text-sub)", padding: "8px"
                                            }}
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="mini-logo"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                >
                                    <div style={{
                                        width: "32px", height: "32px",
                                        background: "var(--admin-primary)",
                                        borderRadius: "8px",
                                        color: "white",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontWeight: "bold", fontSize: "16px"
                                    }}>B</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <nav style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        padding: (isCollapsed && !isMobile) ? "16px 0" : "16px 12px", // Remove horizontal padding when collapsed
                        overflowY: "auto",
                        overflowX: "hidden",
                        alignItems: "center" // Ensure items are centered
                    }}>
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            const showLabel = !isCollapsed || isMobile;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`nav-item ${isActive ? "active" : ""}`}
                                    style={{
                                        // Dynamic styling for compact vs expanded
                                        width: showLabel ? "100%" : "40px",
                                        height: showLabel ? "auto" : "40px",
                                        padding: showLabel ? "12px" : "0",
                                        margin: showLabel ? "0" : "0 auto", // Center in collapsed mode

                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: showLabel ? "flex-start" : "center",

                                        borderRadius: "10px",
                                        transition: "all 0.2s",
                                        color: isActive ? "var(--admin-primary)" : "var(--admin-text-main)",
                                        background: isActive ? "var(--admin-primary-bg)" : "transparent",
                                        position: "relative"
                                    }}
                                    title={!showLabel ? item.label : ""}
                                >
                                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />

                                    {showLabel && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            style={{
                                                marginLeft: "12px",
                                                fontWeight: isActive ? 600 : 500,
                                                whiteSpace: "nowrap"
                                            }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Info (Bottom) - Optional */}
                    {(!isCollapsed || isMobile) && (
                        <div style={{
                            padding: "20px", borderTop: "1px solid var(--admin-border)",
                            fontSize: "12px", color: "var(--admin-text-sub)", textAlign: "center"
                        }}>
                            v1.0.0 Admin
                        </div>
                    )}
                </div>
            </motion.aside>
        </>
    );
}
