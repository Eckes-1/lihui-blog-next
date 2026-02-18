
export const runtime = 'edge';
import { db } from '@/lib/db';

// Provider configurations
const PROVIDERS: Record<string, { name: string; baseUrl: string; models: string[] }> = {
    zhipu: {
        name: '智谱 AI',
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        models: ['glm-4-flash', 'glm-4', 'glm-4-plus', 'glm-4v']
    },
    openai: {
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1/chat/completions',
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo']
    },
    anthropic: {
        name: 'Anthropic Claude',
        baseUrl: 'https://api.anthropic.com/v1/messages',
        models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307']
    },
    deepseek: {
        name: 'DeepSeek',
        baseUrl: 'https://api.deepseek.com/v1/chat/completions',
        models: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner']
    },
    qwen: {
        name: '通义千问',
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        models: ['qwen-turbo', 'qwen-plus', 'qwen-max']
    },
    custom: {
        name: '自定义 API',
        baseUrl: '',
        models: []
    }
};

async function getSettings() {
    try {
        const result = await db.execute('SELECT * FROM ai_settings WHERE id = 1');
        if (result.rows.length > 0) {
            return result.rows[0];
        }
    } catch (e) {
        // Table might not exist
    }
    return null;
}

export async function POST(request: Request) {
    try {
        const { prompt, type } = await request.json();

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return new Response(
                JSON.stringify({ error: '请输入内容后再发送' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get settings from database
        const settings = await getSettings();

        let provider = 'zhipu';
        let apiKey = process.env.ZHIPU_API_KEY || '';
        let model = 'glm-4-flash';
        let baseUrl = '';

        if (settings) {
            provider = settings.provider as string || 'zhipu';
            apiKey = settings.api_key as string || apiKey;
            model = settings.model as string || model;
            baseUrl = settings.base_url as string || '';
        }

        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: '❌ 未配置 API Key\n\n请前往【AI 设置】页面配置您的 AI 服务提供商和 API Key。' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Determine API URL
        let apiUrl = '';
        let headers: Record<string, string> = {};
        let bodyData: any = {};

        if (provider === 'anthropic') {
            // Anthropic uses different streaming format
            apiUrl = 'https://api.anthropic.com/v1/messages';
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            };
            bodyData = {
                model,
                max_tokens: 4096,
                stream: true,
                messages: [{ role: 'user', content: prompt }]
            };
        } else {
            // OpenAI-compatible providers
            if (provider === 'custom') {
                if (!baseUrl) {
                    return new Response(
                        JSON.stringify({ error: '❌ 自定义 API 地址未配置' }),
                        { status: 500, headers: { 'Content-Type': 'application/json' } }
                    );
                }
                apiUrl = baseUrl.includes('/chat/completions')
                    ? baseUrl
                    : baseUrl.replace(/\/$/, '') + '/chat/completions';
            } else {
                apiUrl = PROVIDERS[provider]?.baseUrl || PROVIDERS.zhipu.baseUrl;
            }

            headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            };

            bodyData = {
                model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 4096,
                stream: true
            };
        }

        // Make streaming request to AI provider
        const aiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(bodyData)
        });

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            let errorMsg = '';
            try {
                const errorJson = JSON.parse(errorText);
                errorMsg = errorJson.error?.message || errorJson.message || errorText;
            } catch {
                errorMsg = errorText;
            }

            return new Response(
                JSON.stringify({ error: `[${provider}] HTTP ${aiResponse.status}: ${errorMsg}` }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Create a TransformStream to process the SSE data
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const transformStream = new TransformStream({
            async transform(chunk, controller) {
                const text = decoder.decode(chunk);
                const lines = text.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                            continue;
                        }

                        try {
                            const json = JSON.parse(data);

                            if (provider === 'anthropic') {
                                // Handle Anthropic format
                                if (json.type === 'content_block_delta') {
                                    const content = json.delta?.text || '';
                                    if (content) {
                                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                                    }
                                }
                            } else {
                                // Handle OpenAI-compatible format
                                const delta = json.choices?.[0]?.delta;
                                const content = delta?.content || '';
                                const reasoning_content = delta?.reasoning_content || '';

                                if (content || reasoning_content) {
                                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                                        content,
                                        reasoning_content
                                    })}\n\n`));
                                }
                            }
                        } catch (e) {
                            // Skip malformed JSON
                        }
                    }
                }
            }
        });

        // Pipe the AI response through our transform stream
        const responseStream = aiResponse.body?.pipeThrough(transformStream);

        return new Response(responseStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error: any) {
        console.error('AI Stream Error:', error);

        let errorMsg = `❌ AI 流式生成失败: ${error.message}`;

        if (error.message.includes('fetch failed')) {
            errorMsg = '❌ 网络连接失败 (Fetch Failed)\n\n建议检查：\n1. 网络连接是否正常\n2. 是否需要开启/配置代理 (如访问 OpenAI)\n3. API 地址是否正确';
        } else if (error.message.includes('timeout')) {
            errorMsg = '❌ 请求超时\n\nAI 服务响应过慢，请稍后重试或检查网络状况。';
        }

        return new Response(
            JSON.stringify({ error: errorMsg }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
