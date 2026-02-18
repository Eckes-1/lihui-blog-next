
import { NextResponse } from 'next/server';

const PROVIDERS: Record<string, { name: string; baseUrl: string }> = {
    zhipu: { name: '智谱 AI', baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions' },
    openai: { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1/chat/completions' },
    anthropic: { name: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1/messages' },
    deepseek: { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1/chat/completions' },
    qwen: { name: '通义千问', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions' },
};

// 错误信息翻译映射
function translateError(msg: string): string {
    const translations: Record<string, string> = {
        'Incorrect API key provided': 'API 密钥无效，请检查您输入的密钥是否正确',
        'Invalid API Key': 'API 密钥无效',
        'invalid_api_key': 'API 密钥格式错误',
        'Unauthorized': '未授权，请检查 API 密钥',
        'authentication_error': '认证失败，API 密钥无效',
        'invalid_request_error': '请求格式错误',
        'rate_limit_exceeded': '请求过于频繁，请稍后再试',
        'model_not_found': '模型不存在，请检查模型名称',
        'The model': '模型不存在或无权访问',
        'does not exist': '不存在',
        'context_length_exceeded': '内容长度超出限制',
        'server_error': '服务器错误，请稍后再试',
        'Bad Request': '请求参数错误',
        'Not Found': '接口不存在，请检查 API 地址',
        'Internal Server Error': '服务器内部错误',
        'Service Unavailable': '服务暂时不可用',
        'timeout': '请求超时，请检查网络',
        'ECONNREFUSED': '无法连接到服务器',
        'ENOTFOUND': '无法解析服务器地址',
        'fetch failed': '网络请求失败，请检查 API 地址是否正确',
    };

    let translated = msg;
    for (const [en, zh] of Object.entries(translations)) {
        if (msg.toLowerCase().includes(en.toLowerCase())) {
            translated = zh;
            break;
        }
    }
    return translated;
}

async function testOpenAICompatible(apiKey: string, model: string, baseUrl: string) {
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: 'Hi' }],
            max_tokens: 10
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'OK';
}

async function testAnthropic(apiKey: string, model: string) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model,
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hi' }]
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    const data = await response.json();
    return data.content?.[0]?.text || 'OK';
}

export async function POST(request: Request) {
    try {
        const { provider, api_key, model, base_url } = await request.json();

        if (!api_key) {
            return NextResponse.json({
                code: 200,
                msg: 'success',
                data: { success: false, msg: '请输入 API 密钥' }
            });
        }

        if (!model) {
            return NextResponse.json({
                code: 200,
                msg: 'success',
                data: { success: false, msg: '请选择模型' }
            });
        }

        let result = '';

        if (provider === 'anthropic') {
            result = await testAnthropic(api_key, model);
        } else {
            let url = base_url || PROVIDERS[provider]?.baseUrl;
            if (!url) {
                return NextResponse.json({
                    code: 200,
                    msg: 'success',
                    data: { success: false, msg: '请输入 API 地址' }
                });
            }
            // Auto-append /chat/completions if missing
            if (provider === 'custom' && !url.includes('/chat/completions')) {
                url = url.replace(/\/$/, '') + '/chat/completions';
            }
            result = await testOpenAICompatible(api_key, model, url);
        }

        return NextResponse.json({
            code: 200,
            msg: 'success',
            data: {
                success: true,
                msg: `连接成功！AI 已响应`
            }
        });

    } catch (error: any) {
        console.error('Test Connection Error:', error);

        let errorMsg = error.message || '未知错误';

        // Try to parse JSON error response
        try {
            const parsed = JSON.parse(errorMsg);
            errorMsg = parsed.error?.message || parsed.message || parsed.error || errorMsg;
        } catch { }

        // Translate common error messages to Chinese
        const translatedMsg = translateError(errorMsg);

        return NextResponse.json({
            code: 200,
            msg: 'success',
            data: {
                success: false,
                msg: `连接失败：${translatedMsg}`
            }
        });
    }
}
