
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    // Generate simple 4-char random text
    const text = Math.random().toString(36).substring(2, 6).toUpperCase();

    // Create simple SVG manually without external dependencies
    const width = 120;
    const height = 52;
    // Simple noise lines
    const noise = `
        <path d="M10,${Math.random() * height} L${width - 10},${Math.random() * height}" stroke="#cbd5e1" stroke-width="2"/>
        <path d="M${Math.random() * width},10 L${Math.random() * width},${height - 10}" stroke="#cbd5e1" stroke-width="2"/>
        <circle cx="${Math.random() * width}" cy="${Math.random() * height}" r="2" fill="#94a3b8" />
        <circle cx="${Math.random() * width}" cy="${Math.random() * height}" r="2" fill="#94a3b8" />
    `;

    const svg = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f8fafc"/>
            ${noise}
            <text x="50%" y="55%" font-family="Arial, sans-serif" font-weight="bold" font-size="28" fill="#1e293b" dominant-baseline="middle" text-anchor="middle" letter-spacing="4">${text}</text>
        </svg>
    `.trim();

    const response = new NextResponse(svg, {
        status: 200,
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });

    // Set secure cookie
    response.cookies.set('login_captcha', text.toLowerCase(), {
        httpOnly: true,
        path: '/',
        maxAge: 300, // 5 minutes
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });

    return response;
}
