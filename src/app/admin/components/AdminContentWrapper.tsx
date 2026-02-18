"use client";

import { useAdmin } from "../admin-context";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminContentWrapper({ children }: { children: React.ReactNode }) {
    const { refreshKey } = useAdmin();
    // 使用本地状态做一个微小的延迟渲染，以确保 React 确实卸载重装
    // 不过通常 key 变化就足够了。

    // 我们还可以加上一个简单的淡入淡出动画来体现"刷新"感

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={refreshKey}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                style={{ height: '100%' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
