
export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { provider, api_key, base_url } = await request.json();

        if (!api_key) {
            return NextResponse.json({ code: 400, msg: 'API Key 不能为空' });
        }

        let url = '';
        let headers: Record<string, string> = {
            'Authorization': `Bearer ${api_key}`,
            'Content-Type': 'application/json'
        };

        // Determine standard model list URL based on provider
        switch (provider) {
            case 'openai':
                url = 'https://api.openai.com/v1/models';
                break;
            case 'deepseek':
                url = 'https://api.deepseek.com/models';
                break;
            case 'zhipu':
                // Zhipu follows OpenAI format recently.
                url = 'https://open.bigmodel.cn/api/paas/v4/models';
                break;
            case 'qwen':
                // Aliyun Dashscope
                url = 'https://dashscope.aliyuncs.com/compatible-mode/v1/models';
                break;
            case 'anthropic':
                // Anthropic doesn't have a /models endpoint like OpenAI. 
                // We return a static list or handled error.
                return NextResponse.json({
                    code: 200,
                    msg: '成功',
                    data: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307']
                });
            case 'custom':
                if (!base_url) return NextResponse.json({ code: 400, msg: '自定义服务商必须提供 Base URL' });
                // Assume OpenAI compatible /models endpoint
                // Remove /chat/completions if present to find root or just append /models to base
                // If base_url is "https://api.xxx.com/v1/chat/completions", we want "https://api.xxx.com/v1/models"
                url = base_url.replace(/\/chat\/completions\/?$/, '/models');
                if (url === base_url) {
                    // If replacement didn't happen, maybe user passed root "https://api.xxx.com/v1"
                    url = `${base_url}/models`.replace(/([^:]\/)\/+/g, "$1"); // remove double slashes
                }
                break;
            default:
                return NextResponse.json({ code: 400, msg: '未知的服务商' });
        }

        const response = await fetch(url, { method: 'GET', headers });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Fetch Models Error:', errText);

            let statusMsg = '请求失败';
            switch (response.status) {
                case 401: statusMsg = '认证失败 (请检查 API Key)'; break;
                case 403: statusMsg = '无权访问 (请检查权限)'; break;
                case 404: statusMsg = '接口不存在 (请检查 Base URL)'; break;
                case 429: statusMsg = '请求过多 (限流)'; break;
                case 500: statusMsg = '服务商服务器错误'; break;
                default: statusMsg = `请求失败 (${response.status})`;
            }

            return NextResponse.json({
                code: response.status,
                msg: statusMsg,
                error: errText
            });
        }

        const data = await response.json();

        // Normalize data: OpenAI format returns { data: [{ id: 'gpt-4' }, ...] }
        let models: string[] = [];
        if (Array.isArray(data.data)) {
            models = data.data.map((m: any) => m.id);
        } else if (Array.isArray(data)) {
            models = data.map((m: any) => m.id || m.model);
        }

        return NextResponse.json({
            code: 200,
            msg: '成功',
            data: models
        });

    } catch (error) {
        console.error('Fetch Models API Error:', error);
        return NextResponse.json({ code: 500, msg: '内部服务器错误' });
    }
}
