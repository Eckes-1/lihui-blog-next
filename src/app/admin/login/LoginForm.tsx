
"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginLeftView } from "./LoginLeftView";
import { Loader2, User, Lock, KeyRound, ShieldCheck, Eye, EyeOff, Github } from "lucide-react";
import "./styles.css";

interface LoginFormProps {
    loginBgUrl?: string;
    loginBgOpacity?: number;
    loginFormOpacity?: number;
    loginTitle?: string;
    loginSubtitle?: string;
}

export default function LoginForm({
    loginBgUrl = "",
    loginBgOpacity = 85,
    loginFormOpacity = 100,
    loginTitle = "后台登录",
    loginSubtitle = "请输入详细信息以完成安全登录"
}: LoginFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");     // Email Code
    const [captcha, setCaptcha] = useState(""); // Graphic Captcha
    const [showPassword, setShowPassword] = useState(false);

    const [captchaUrl, setCaptchaUrl] = useState("");

    // Code Timer
    const [timer, setTimer] = useState(0);
    const [isSending, setIsSending] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    const refreshCaptcha = () => {
        setCaptchaUrl(`/api/common/captcha?t=${Date.now()}`);
    }

    // Initial Load Captcha & Check Errors
    useEffect(() => {
        refreshCaptcha();

        const errorType = searchParams.get("error");
        if (errorType === "GitHubUnauthorized") {
            setError("您没有权限登录此后台 (GitHub账号不在白名单中)");
        }
    }, [searchParams]);

    // Handle Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendCode = async () => {
        if (!email) {
            setError("请先输入邮箱地址");
            return;
        }

        setIsSending(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch('/api/auth/send-verification-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || '发送失败');
            }

            setTimer(60);
            setSuccess("验证码已发送，请查收邮件");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSending(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        // 1. Pre-Check
        try {
            const preRes = await fetch('/api/auth/pre-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, code, captcha })
            });

            const preData = await preRes.json();

            if (!preRes.ok || preData.error) {
                setError(preData.error || "登录校验失败");
                refreshCaptcha();
                setLoading(false);
                return;
            }
        } catch (err: any) {
            setError("网络连接错误，请检查您的网络");
            setLoading(false);
            return;
        }

        // 2. SignIn
        const res = await signIn("credentials", {
            email,
            password,
            code,
            captcha,
            redirect: false,
        });

        if (res?.error) {
            setError("登录失败：系统内部错误");
            refreshCaptcha();
            setLoading(false);
        } else {
            setSuccess("登录成功，正在进入系统...");
            setTimeout(() => {
                router.push("/admin");
            }, 800);
        }
    };

    // Global background style with CSS Variable for opacity
    const isVideo = /\.(mp4|webm|ogg)$/i.test(loginBgUrl);

    const containerStyle = {
        ...((loginBgUrl && !isVideo) ? {
            backgroundImage: `url(${loginBgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        } : {}),
        '--form-opacity': loginFormOpacity / 100,
        position: 'relative',
        overflow: 'hidden'
    } as React.CSSProperties;

    return (
        <div className="login-container" style={containerStyle}>
            {/* Video Background Layer */}
            {loginBgUrl && isVideo && (
                <video
                    src={loginBgUrl}
                    autoPlay loop muted playsInline
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 0
                    }}
                />
            )}

            {/* Global Overlay for bgOpacity */}
            {loginBgUrl && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `rgba(255,255,255, ${loginBgOpacity / 100})`,
                    zIndex: 1
                }} />
            )}

            {/* Layout Wrapper (Relative, z-index 2 to sit on top of everything) */}
            <div style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                position: 'relative',
                zIndex: 2
            }}>
                <LoginLeftView bgUrl={loginBgUrl} />

                <div className="login-right-view">
                    <div className="form-card">
                        <div className="header-section">
                            <h3>{loginTitle}</h3>
                            <p>{loginSubtitle}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form">
                            {error && (
                                <div className="error-alert">
                                    <span>{error}</span>
                                </div>
                            )}
                            {success && (
                                <div className="success-alert">
                                    <span>{success}</span>
                                </div>
                            )}

                            <div className="input-group">
                                <div className="icon-wrapper">
                                    <User size={20} color="#94a3b8" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="请输入邮箱账号"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="custom-input"
                                />
                            </div>

                            <div className="input-group">
                                <div className="icon-wrapper">
                                    <Lock size={20} color="#94a3b8" />
                                </div>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="请输入密码"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="custom-input"
                                    style={{ paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        color: '#94a3b8',
                                        zIndex: 10,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="input-group code-group">
                                <div className="icon-wrapper">
                                    <KeyRound size={20} color="#94a3b8" />
                                </div>
                                <input
                                    name="code"
                                    type="text"
                                    placeholder="请输入 6 位验证码"
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    required
                                    className="custom-input"
                                    maxLength={6}
                                />
                                <button
                                    type="button"
                                    className="send-code-btn"
                                    disabled={timer > 0 || isSending || !email}
                                    onClick={handleSendCode}
                                >
                                    {timer > 0 ? `${timer}s后重试` : (isSending ? '发送验证码' : '获取验证码')}
                                </button>
                            </div>

                            <div className="input-group captcha-row">
                                <div className="captcha-input-wrap">
                                    <div className="icon-wrapper">
                                        <ShieldCheck size={20} color="#94a3b8" />
                                    </div>
                                    <input
                                        name="captcha"
                                        type="text"
                                        placeholder="图形验证码"
                                        value={captcha}
                                        onChange={e => setCaptcha(e.target.value)}
                                        required
                                        className="custom-input small"
                                        maxLength={4}
                                    />
                                </div>
                                <div className="captcha-img" onClick={refreshCaptcha} title="点击刷新">
                                    {captchaUrl ? (
                                        <img src={captchaUrl} alt="Captcha" />
                                    ) : (
                                        <div className="loading-placeholder">...</div>
                                    )}
                                </div>
                            </div>

                            <div className="spacer"></div>

                            <button type="submit" className="login-btn" disabled={loading}>
                                {loading ? <Loader2 className="spin" size={20} /> : "登 录"}
                            </button>

                            <div style={{ display: "flex", alignItems: "center", margin: "20px 0", color: "#94a3b8", fontSize: "12px" }}>
                                <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
                                <span style={{ padding: "0 10px" }}>或</span>
                                <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
                            </div>

                            <button
                                type="button"
                                onClick={() => signIn("github", { callbackUrl: "/admin" })}
                                className="github-btn"
                                style={{
                                    width: "100%",
                                    height: "44px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "10px",
                                    background: "#24292e",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                <Github size={20} />
                                使用 GitHub 登录
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
