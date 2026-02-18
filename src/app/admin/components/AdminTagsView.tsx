"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Tag {
    path: string;
    title: string;
}

export default function AdminTagsView() {
    const pathname = usePathname();
    const router = useRouter();
    // 初始状态包含 Dashboard
    const [tags, setTags] = useState<Tag[]>([
        { path: "/admin", title: "仪表盘" }
    ]);

    useEffect(() => {
        // 当路由变化是，检查 tags 是否已存在，不存在则添加
        if (!tags.find(tag => tag.path === pathname)) {
            // 简单的路径到标题映射逻辑
            let title = "未知页面";
            if (pathname === "/admin") title = "仪表盘";
            else if (pathname.includes("/admin/posts")) title = "文章管理";
            else if (pathname.includes("/admin/ai/configs")) title = "API 配置";
            else if (pathname.includes("/admin/ai/settings")) title = "AI 设置";
            else if (pathname.includes("/admin/settings")) title = "系统设置";
            else if (pathname.includes("/admin/editor")) title = "编辑器";
            else {
                // 如果没有匹配，取最后一段路径并首字母大写
                const lastSegment = pathname.split('/').pop() || "Page";
                title = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
            }

            setTags(prev => [...prev, { path: pathname, title }]);
        }
    }, [pathname]);

    const removeTag = (path: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const newTags = tags.filter(tag => tag.path !== path);
        setTags(newTags);

        // 如果关闭的是当前激活的 tag，跳转到最后一个 tag
        if (path === pathname) {
            const lastTag = newTags[newTags.length - 1];
            if (lastTag) {
                router.push(lastTag.path);
            } else {
                router.push("/admin");
            }
        }
    };

    return (
        <div style={{
            height: "44px", // Slight increase for better touch target
            background: "var(--admin-bg)", // Match main bg
            borderBottom: "1px solid var(--admin-border)",
            display: "flex",
            alignItems: "center",
            padding: "0 10px",
            gap: "6px",
            overflowX: "auto",
            scrollBehavior: "smooth",
            whiteSpace: "nowrap"
        }}>
            <AnimatePresence>
                {tags.map((tag) => {
                    const isActive = pathname === tag.path;
                    return (
                        <motion.div
                            key={tag.path}
                            initial={{ opacity: 0, scale: 0.9, x: -10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, width: 0 }}
                            layout
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                            <Link
                                href={tag.path}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "6px 12px",
                                    fontSize: "12px",
                                    borderRadius: "4px",
                                    textDecoration: "none",
                                    background: isActive ? "white" : "transparent",
                                    color: isActive ? "var(--admin-primary)" : "var(--admin-text-sub)",
                                    border: isActive ? "1px solid var(--admin-border)" : "1px solid transparent",
                                    boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    fontWeight: isActive ? 600 : 400
                                }}
                            >
                                <span style={{ marginRight: "6px" }}>{tag.title}</span>
                                {tag.path !== "/admin" && (
                                    <span
                                        onClick={(e) => removeTag(tag.path, e)}
                                        className="close-icon"
                                        title="关闭"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            borderRadius: "50%",
                                            padding: "2px"
                                        }}
                                    >
                                        <X size={12} />
                                    </span>
                                )}
                            </Link>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            <style jsx global>{`
                .close-icon:hover {
                    background: rgba(0,0,0,0.1);
                    color: #ef4444;
                }
            `}</style>
        </div>
    );
}
