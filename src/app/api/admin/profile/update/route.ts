import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "未授权访问" }, { status: 401 });
        }

        const body = await req.json();
        // Extract known settings fields, ignore others for safety
        const { emailNotif, pushNotif, theme, compactMode } = body;

        const settings = JSON.stringify({
            emailNotif: !!emailNotif,
            pushNotif: !!pushNotif,
            theme: theme || 'light',
            compactMode: !!compactMode
        });

        // Also update theme preference in settings column
        await db.execute({
            sql: "UPDATE users SET settings = ? WHERE id = ?",
            args: [settings, session.user.id]
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
    }
}
