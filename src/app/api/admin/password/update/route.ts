
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "未授权" }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        // Check if user exists
        const userResult = await db.execute({
            sql: "SELECT * FROM users WHERE id = ?",
            args: [session.user.id]
        });

        const user = userResult.rows[0];
        if (!user) {
            return NextResponse.json({ error: "用户不存在" }, { status: 404 });
        }

        // Verify old password
        const isValid = await bcrypt.compare(currentPassword, user.password as string);
        if (!isValid) {
            return NextResponse.json({ error: "当前密码错误" }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Allow null for settings if it was undefined before
        await db.execute({
            sql: "UPDATE users SET password = ? WHERE id = ?",
            args: [hashedPassword, session.user.id]
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Password change error:", e);
        return NextResponse.json({ error: "内部服务器错误" }, { status: 500 });
    }
}
