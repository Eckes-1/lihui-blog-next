
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, RefreshCw, X, LogOut } from "lucide-react";

export default function SessionWarning() {
    const router = useRouter();
    const [expiresAt, setExpiresAt] = useState<number | null>(null);
    const [showWarning, setShowWarning] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const getRemainingSeconds = () => {
        if (!expiresAt) return Infinity;
        return Math.floor((expiresAt - Date.now()) / 1000);
    };

    const checkSession = async () => {
        try {
            const res = await fetch("/api/auth/session");
            const data = await res.json();

            if (data?.user?.expiresAt) {
                setExpiresAt(data.user.expiresAt);
                // If renewed (more than 5 mins left), hide warning
                if (data.user.expiresAt - Date.now() > 5 * 60 * 1000) {
                    setShowWarning(false);
                }
            } else {
                // If session is already gone/invalid, maybe clear local state
                setExpiresAt(null);
            }
        } catch (e) {
            console.error("Session check failed", e);
        }
    };

    // Initial check & interval setup
    useEffect(() => {
        checkSession();

        // Background check loop
        intervalRef.current = setInterval(() => {
            const remaining = getRemainingSeconds();

            // Trigger warning if < 5 mins (300s) and valid expiry exists
            if (expiresAt && remaining < 300 && remaining > 0 && !showWarning) {
                setShowWarning(true);
            }

            // Auto-renew attempt (keep-alive) if user is active
            if (document.visibilityState === 'visible' && remaining > 300) {
                checkSession();
            }

            // Expiry handling could go here (e.g. force redirect)
        }, 10000); // Check every 10s

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [expiresAt, showWarning]);

    const handleRenew = async () => {
        setIsRefreshing(true);
        // Force renewal
        await checkSession();

        setTimeout(() => {
            setIsRefreshing(false);
            // Hide is handled by checkSession -> setExpiresAt -> effect
        }, 800);
    };

    if (!showWarning) return null;

    const remaining = getRemainingSeconds();
    if (remaining <= 0) return null; // Don't show if already expired

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    return (
        <AnimatePresence>
            {showWarning && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: -50, x: "-50%" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{
                        position: "fixed",
                        top: "24px",
                        left: "50%",
                        background: "rgba(255, 255, 255, 0.90)",
                        backdropFilter: "blur(12px) saturate(180%)",
                        border: "1px solid rgba(234, 179, 8, 0.4)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255,255,255,0.4) inset",
                        padding: "8px 16px 8px 12px",
                        borderRadius: "100px", // Pill shape
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        minWidth: "340px",
                        justifyContent: "space-between"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            background: "linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)",
                            color: "#CA8A04",
                            width: "36px", height: "36px", borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 2px 5px rgba(254, 240, 138, 0.5)",
                            flexShrink: 0
                        }}>
                            <Clock size={18} strokeWidth={2.5} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#422006", letterSpacing: "-0.01em" }}>
                                登录即将过期
                            </span>
                            <span style={{ fontSize: "12px", color: "#854D0E", fontVariantNumeric: "tabular-nums", display: "flex", alignItems: "center", gap: "4px" }}>
                                剩余: <strong style={{ color: "#D97706", fontFamily: "monospace", fontSize: "13px" }}>{minutes}:{seconds.toString().padStart(2, '0')}</strong>
                            </span>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                            onClick={handleRenew}
                            disabled={isRefreshing}
                            style={{
                                padding: "6px 16px",
                                borderRadius: "20px",
                                border: "none",
                                background: "linear-gradient(135deg, #EAB308 0%, #CA8A04 100%)",
                                color: "white",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex", alignItems: "center", gap: "6px",
                                boxShadow: "0 2px 8px rgba(234, 179, 8, 0.4)",
                                transition: "all 0.2s",
                                height: "32px"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                        >
                            <RefreshCw size={13} className={isRefreshing ? "spin" : ""} strokeWidth={2.5} />
                            {isRefreshing ? "..." : "续期"}
                        </button>

                        <button
                            onClick={() => router.push("/admin/login")}
                            style={{
                                background: "rgba(0,0,0,0.04)", border: "none",
                                color: "#78350F", cursor: "pointer",
                                width: "32px", height: "32px", borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.2s"
                            }}
                            title="退出登录"
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.08)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.04)"}
                        >
                            <LogOut size={15} strokeWidth={2.5} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
