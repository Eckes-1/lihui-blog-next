
import LoginForm from "./LoginForm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
    let bgUrl = "";
    let bgOpacity = 85;
    let formOpacity = 100;
    let bgTitle = "后台登录";
    let bgSubtitle = "请输入详细信息以完成安全登录";

    try {
        const rs = await db.execute({
            sql: "SELECT key, value FROM settings WHERE key IN ('login_bg_url', 'login_bg_opacity', 'login_form_opacity', 'login_title', 'login_subtitle')",
            args: []
        });

        rs.rows.forEach(row => {
            if (row.key === 'login_bg_url') bgUrl = row.value as string;
            if (row.key === 'login_bg_opacity') bgOpacity = Number(row.value);
            if (row.key === 'login_form_opacity') formOpacity = Number(row.value);
            if (row.key === 'login_title') bgTitle = row.value as string;
            if (row.key === 'login_subtitle') bgSubtitle = row.value as string;
        });
    } catch (error) {
        console.error("Failed to fetch login settings:", error);
    }

    return <LoginForm
        loginBgUrl={bgUrl}
        loginBgOpacity={bgOpacity}
        loginFormOpacity={formOpacity}
        loginTitle={bgTitle}
        loginSubtitle={bgSubtitle}
    />;
}
