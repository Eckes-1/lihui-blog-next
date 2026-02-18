import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "没有上传文件" }, { status: 400 });
        }

        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 尝试获取 Cloudflare 环境变量
        let env: CloudflareEnv = {};
        try {
            // @ts-ignore
            if (process.env.NODE_ENV === 'production') {
                const { getRequestContext } = await import('@cloudflare/next-on-pages');
                env = getRequestContext().env as CloudflareEnv;
            }
        } catch (e) {
            // 本地开发环境或非 CF 环境，尝试读取 process.env
            env = process.env as any;
        }

        // 方案 1: Cloudflare R2 (如果配置了)
        if (env.MY_BUCKET) {
            await env.MY_BUCKET.put(filename, arrayBuffer, {
                httpMetadata: { contentType: file.type }
            });
            const url = env.R2_DOMAIN 
                ? `${env.R2_DOMAIN.replace(/\/$/, '')}/${filename}` 
                : `/uploads/${filename}`;
            return NextResponse.json({ url });
        }

        // 方案 2: GitHub 仓库存储 (作为 R2 的替代方案)
        if (env.GITHUB_TOKEN && env.GITHUB_REPO) {
            const repo = env.GITHUB_REPO; // "username/repo"
            const branch = env.GITHUB_BRANCH || 'main';
            // 存储在 public/uploads 目录下，这样如果仓库也是部署源，理论上可以直接访问（但在 CF Pages 重新部署前可能无法立即访问）
            // 建议使用 jsDelivr 加速访问
            const path = `public/uploads/${filename}`;
            const content = buffer.toString('base64');

            const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Blog-Next-App'
                },
                body: JSON.stringify({
                    message: `Upload ${filename} via Blog Admin`,
                    content: content,
                    branch: branch
                })
            });

            if (!res.ok) {
                const error = await res.json();
                console.error("GitHub Upload Error:", error);
                throw new Error(`GitHub upload failed: ${error.message}`);
            }

            // 返回 jsDelivr CDN 链接 (实时性好，且免费)
            // 格式: https://cdn.jsdelivr.net/gh/user/repo@branch/file
            const cdnUrl = `https://cdn.jsdelivr.net/gh/${repo}@${branch}/${path}`;
            return NextResponse.json({ url: cdnUrl });
        }

        // 方案 3: 本地文件系统 (仅 Node.js / 本地开发环境)
        // 注意: Edge Runtime 不支持 fs/promises 和 path，因此必须动态导入并进行环境检查
        try {
            // 在 Edge Runtime 中，这些导入会失败或 process.cwd 不存在
            if (process.env.NEXT_RUNTIME === 'edge') {
                 throw new Error("Local file system is not supported in Edge Runtime.");
            }

            const fs = await import('fs/promises');
            const path = await import('path');
            
            // Upload path: public/uploads
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');

            try {
                await fs.mkdir(uploadDir, { recursive: true });
            } catch (e) { }

            const filePath = path.join(uploadDir, filename);
            await fs.writeFile(filePath, buffer);

            return NextResponse.json({ url: `/uploads/${filename}` });
        } catch (e) {
            // console.error("Local file write failed:", e);
            return NextResponse.json({ 
                error: "上传失败：当前环境 (Edge/Cloudflare) 不支持本地文件写入，且未配置 R2 或 GitHub 存储。" 
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "文件上传失败: " + error.message }, { status: 500 });
    }
}
