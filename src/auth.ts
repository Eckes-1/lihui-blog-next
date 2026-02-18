
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        GitHub,
        Credentials({
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
                code: { label: "Code", type: "text" },
                captcha: { label: "Captcha", type: "text" },
            },
            authorize: async (credentials) => {
                try {
                    const email = (credentials.email as string) || "admin@example.com";
                    console.log(`[Auth] Attempting secure login for ${email}`);

                    // 1. Verify Graphic Captcha first (Fastest check)
                    const userCaptcha = credentials.captcha as string;
                    try {
                        const cookieStore = await cookies();
                        const sessionCaptcha = cookieStore.get('login_captcha')?.value;
                        if (!sessionCaptcha || !userCaptcha || userCaptcha.toLowerCase() !== sessionCaptcha) {
                            console.log(`[Auth] Captcha mismatch. User: ${userCaptcha}, Session: ${sessionCaptcha}`);
                            throw new Error("图形验证码错误");
                        }
                    } catch (e: any) {
                        if (e.message === "图形验证码错误") return null;
                        console.warn("[Auth] Cookie access failed during captcha check", e);
                        return null;
                    }

                    // 2. Verify Email Code (OTP)
                    const code = credentials.code as string;
                    const codeRs = await db.execute({
                        sql: "SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > ? ORDER BY created_at DESC LIMIT 1",
                        args: [email, code, Date.now()]
                    });

                    if (codeRs.rows.length === 0) {
                        console.log("[Auth] Invalid or expired email code");
                        return null;
                    }

                    // 3. Verify Password & User Existence
                    const rs = await db.execute({
                        sql: "SELECT * FROM users WHERE email = ?",
                        args: [email]
                    });

                    const user = rs.rows[0];
                    if (!user) {
                        // Legacy fallback
                        const legacyPw = process.env.ADMIN_PASSWORD;
                        const inputPw = credentials.password as string;
                        if (legacyPw && inputPw === legacyPw && email === 'admin@example.com') {
                            return { id: "1", name: "Admin", email: "admin@example.com" };
                        }
                        return null;
                    }

                    const isValid = await bcrypt.compare(credentials.password as string, user.password as string);

                    if (isValid) {
                        return {
                            id: String(user.id),
                            name: String(user.name || 'Admin'),
                            email: String(user.email || ''),
                            image: String(user.image || '')
                        }
                    }
                    console.log("[Auth] Password mismatch");
                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 Days (Long lifespan, controlled by logic below)
    },
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // Check if GitHub login is restricted to specific user
            if (account?.provider === "github") {
                const allowedUser = process.env.ADMIN_GITHUB_USER;
                const githubUser = (profile as any)?.login;

                if (allowedUser) {
                    if (githubUser !== allowedUser) {
                        console.warn(`[Auth] Unauthorized GitHub Access Attempt: ${githubUser}`);
                        // Redirect to login page with error
                        return "/admin/login?error=GitHubUnauthorized";
                    }
                }
            }
            return true;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnAdmin = nextUrl.pathname.startsWith("/admin")
            const isOnLogin = nextUrl.pathname.startsWith("/admin/login")

            if (isOnAdmin) {
                if (isOnLogin) return true
                if (isLoggedIn) return true
                return false
            }
            return true
        },
        async jwt({ token, user, trigger, session }) {
            // 1. Initial Sign In
            if (user) {
                token.id = user.id;
                token.lastActivity = Date.now();
            }

            // 2. Check Expiration & Auto-Renew (Sliding Window)
            if (token.lastActivity) {
                const duration = await getSessionDuration();
                const lastActivity = token.lastActivity as number;
                const expiry = lastActivity + (duration * 1000);
                const now = Date.now();
                const remaining = (expiry - now) / 1000;

                // Log for debugging
                // console.log(`[Auth] Remaining: ${remaining.toFixed(1)}s`);

                // A. Check if expired
                if (now > expiry) {
                    console.log("[Auth] Session expired! Invalidating token.");
                    return null;
                }

                // B. Auto-Renew: If valid and user is active, extend session.
                // Update timestamp if more than 5 minutes (300s) have passed since last update
                // OR if remaining time is less than half of duration (prevent premature logout)
                const shouldRenew = (now - lastActivity) > 5 * 60 * 1000;

                if (shouldRenew) {
                    // console.log(`[Auth] Auto-renewing session. Extended by ${duration}s.`);
                    token.lastActivity = now;
                }

                // Store expiration timestamp for client access
                token.expiresAt = (token.lastActivity as number) + (duration * 1000);
            }

            if (trigger === "update" && session) {
                return { ...token, ...session.user };
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
                // Pass expiration to client session
                (session.user as any).expiresAt = token.expiresAt;
            }
            return session;
        }
    },
})

// Helper: Get session duration with simple caching
let durationCache = { value: 1800, timestamp: 0 };
async function getSessionDuration() {
    if (Date.now() - durationCache.timestamp < 60000) {
        return durationCache.value;
    }
    try {
        const res = await db.execute({
            sql: "SELECT value FROM settings WHERE key = 'login_session_duration'",
            args: []
        });
        const val = Number(res.rows[0]?.value);
        if (val) {
            durationCache = { value: val, timestamp: Date.now() };
            return val;
        }
    } catch (e) {
        // fallback
    }
    return 1800; // Default 30 min
}
