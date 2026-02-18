
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { email, password, code, captcha } = await req.json();

        // 1. 优先校验图形验证码
        const cookieStore = await cookies();
        const sessionCaptcha = cookieStore.get('login_captcha')?.value;

        if (!sessionCaptcha) {
            return NextResponse.json({ error: "图形验证码已过期，请刷新页面重试" }, { status: 400 });
        }
        if (!captcha || captcha.toLowerCase() !== sessionCaptcha) {
            return NextResponse.json({ error: "图形验证码错误，请区分字母大小写" }, { status: 400 });
        }

        // 2. 校验邮箱验证码
        // 查找最近一条未过期的验证码
        const codeRs = await db.execute({
            sql: "SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > ? ORDER BY created_at DESC LIMIT 1",
            args: [email, code, Date.now()]
        });

        if (codeRs.rows.length === 0) {
            // 细化错误：是验证码不对，还是过期了？
            // 查一下有没有过期的记录
            const expiredRs = await db.execute({
                sql: "SELECT * FROM verification_codes WHERE email = ? AND code = ? ORDER BY created_at DESC LIMIT 1",
                args: [email, code]
            });
            if (expiredRs.rows.length > 0) {
                return NextResponse.json({ error: "邮箱验证码已过期，请重新获取" }, { status: 400 });
            }
            return NextResponse.json({ error: "邮箱验证码错误" }, { status: 400 });
        }

        // 3. 校验账号和密码
        const userRs = await db.execute({
            sql: "SELECT * FROM users WHERE email = ? LIMIT 1",
            args: [email]
        });

        const user = userRs.rows[0];
        if (!user) {
            return NextResponse.json({ error: "该邮箱未注册管理员账号" }, { status: 400 });
        }

        const isValid = await bcrypt.compare(password, user.password as string);
        if (!isValid) {
            return NextResponse.json({ error: "密码错误，请检查输入" }, { status: 400 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Pre-check error:", error);
        return NextResponse.json({ error: "服务器内部校验错误" }, { status: 500 });
    }
}
