
export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const username = body.username || body.userName;
        const password = body.password;

        console.log('[API] Login Attempt:', { username, passwordMatch: password === process.env.ADMIN_PASSWORD });

        // Simple check against env variable
        const validUsername = '2490918758@qq.com';
        if ((username === validUsername || username === 'admin') && password === process.env.ADMIN_PASSWORD) {
            // Generate a mock token (in production use a real JWT)
            const accessToken = 'mock-jwt-token-admin-' + Date.now();

            return NextResponse.json({
                code: 200,
                msg: '登录成功',
                data: {
                    token: accessToken, // Vue app expects 'token'
                    refreshToken: 'mock-refresh-token',
                    expires: '2030/01/01 00:00:00'
                }
            });
        }

        return NextResponse.json({
            code: 401,
            msg: '用户名或密码错误',
            data: null
        }, { status: 200 }); // Status 200 because the frontend checks the 'code' field

    } catch (error) {
        return NextResponse.json({
            code: 500,
            msg: 'Internal Server Error',
            data: null
        });
    }
}
