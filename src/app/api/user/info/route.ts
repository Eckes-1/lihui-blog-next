
export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // In a real app, verify the Authorization header here
    // const authHeader = request.headers.get('Authorization');

    return NextResponse.json({
        code: 200,
        msg: 'success',
        data: {
            userId: 1,
            username: 'admin',
            realName: 'Admin',
            avatar: 'https://assets.qbox.net/img/avatar.png',
            desc: 'Super Administrator',
            roles: ['R_SUPER'], // Matches the role check in Vue
            homePath: '/dashboard/console'
        }
    });
}
