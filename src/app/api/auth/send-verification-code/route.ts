
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        // Expires in 5 minutes (in milliseconds)
        const expiresAt = Date.now() + 5 * 60 * 1000;

        // Store in database
        await db.execute({
            sql: "INSERT INTO verification_codes (email, code, expires_at, created_at) VALUES (?, ?, ?, ?)",
            args: [email, code, expiresAt, Date.now()]
        });

        // Send Email via Resend REST API (using fetch instead of SDK for Edge compatibility)
        const resendApiKey = process.env.RESEND_API_KEY;

        if (resendApiKey) {
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

            const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: fromEmail,
                    to: email,
                    subject: '后台登录验证码',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #3b82f6;">后台管理系统登录</h2>
                            <p>您的验证码是：</p>
                            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0;">
                                ${code}
                            </div>
                            <p>验证码有效期为 5 分钟。</p>
                            <p style="color: #666; font-size: 12px; margin-top: 30px;">如果您没有请求此代码，请忽略此邮件。</p>
                        </div>
                    `,
                }),
            });

            if (!resendResponse.ok) {
                const errorData = await resendResponse.json();
                console.error('[Resend Error]', errorData);
                throw new Error('Failed to send email via Resend');
            }

            const data = await resendResponse.json() as any;
            console.log(`[Resend] Code sent to ${email} (ID: ${data?.id})`);
        } else {
            // Dev mode: Log code to console if RESEND_API_KEY not configured
            console.log(`[DEV MODE - No RESEND_API_KEY] Verification Code for ${email}: ${code}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Send verification code error:', error);
        return NextResponse.json(
            { error: 'Failed to send verification code' },
            { status: 500 }
        );
    }
}
