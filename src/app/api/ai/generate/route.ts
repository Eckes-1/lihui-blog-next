
export const runtime = 'edge';

import { NextResponse } from 'next/server';
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
        models: ['deepseek-chat', 'deepseek-coder']
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

function getPrompts(type: string, userInput: string): { system: string; user: string } {
    // 不使用内置提示词，直接传递用户输入
    return {
        system: '',
        user: userInput
    };
}

// 详细错误信息类型
interface APIResult {
    success: boolean;
    content?: string;
    reasoning_content?: string; // DeepSeek 深度思考内容
    error?: string;
}

async function callZhipu(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<APIResult> {
    const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model,
                messages: systemPrompt
                    ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
                    : [{ role: 'user', content: userPrompt }],
                temperature: 0.7,
                max_tokens: 4096
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.error?.message || data.message || data.msg || JSON.stringify(data);
            return {
                success: false,
                error: `[智谱 AI] HTTP ${response.status}: ${errorMsg}`
            };
        }

        if (data.error) {
            return {
                success: false,
                error: `[智谱 AI] API 错误: ${data.error.message || data.error.code || JSON.stringify(data.error)}`
            };
        }

        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            return {
                success: false,
                error: `[智谱 AI] 响应格式异常: 未找到生成内容。原始响应: ${JSON.stringify(data).slice(0, 200)}`
            };
        }

        return { success: true, content };

    } catch (e: any) {
        if (e.name === 'TypeError' && e.message.includes('fetch')) {
            return { success: false, error: `[智谱 AI] 网络连接失败: 无法连接到 ${url}` };
        }
        return { success: false, error: `[智谱 AI] 请求异常: ${e.message}` };
    }
}

async function callOpenAI(apiKey: string, model: string, baseUrl: string, systemPrompt: string, userPrompt: string): Promise<APIResult> {
    const url = baseUrl || 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model,
                messages: systemPrompt
                    ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
                    : [{ role: 'user', content: userPrompt }],
                temperature: 0.7,
                max_tokens: 4096
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // 处理常见 OpenAI 错误
            if (response.status === 401) {
                return { success: false, error: `[OpenAI] 认证失败 (401): API Key 无效或已过期` };
            }
            if (response.status === 429) {
                const retryAfter = response.headers.get('retry-after');
                return { success: false, error: `[OpenAI] 请求过于频繁 (429): 已触发速率限制${retryAfter ? `，请 ${retryAfter} 秒后重试` : ''}` };
            }
            if (response.status === 400) {
                return { success: false, error: `[OpenAI] 请求参数错误 (400): ${data.error?.message || '模型名称可能不正确'}` };
            }
            if (response.status === 404) {
                return { success: false, error: `[OpenAI] 模型不存在 (404): 模型 "${model}" 无法访问，请检查模型名称或账户权限` };
            }
            if (response.status === 500 || response.status === 502 || response.status === 503) {
                return { success: false, error: `[OpenAI] 服务器错误 (${response.status}): API 服务暂时不可用，请稍后重试` };
            }

            const errorMsg = data.error?.message || data.message || JSON.stringify(data);
            return { success: false, error: `[OpenAI] HTTP ${response.status}: ${errorMsg}` };
        }

        if (data.error) {
            return {
                success: false,
                error: `[OpenAI] API 错误: ${data.error.message || data.error.type || JSON.stringify(data.error)}`
            };
        }

        const message = data.choices?.[0]?.message;
        const content = message?.content;
        // DeepSeek 深度思考模型会返回 reasoning_content 字段
        const reasoning_content = message?.reasoning_content;

        if (!content && !reasoning_content) {
            return {
                success: false,
                error: `[OpenAI] 响应格式异常: 未找到生成内容。原始响应: ${JSON.stringify(data).slice(0, 200)}`
            };
        }

        return { success: true, content: content || '', reasoning_content };

    } catch (e: any) {
        if (e.name === 'TypeError' && e.message.includes('fetch')) {
            return { success: false, error: `[API] 网络连接失败: 无法连接到 ${url}，请检查网络或 API 地址是否正确` };
        }
        if (e.message.includes('JSON')) {
            return { success: false, error: `[API] 响应解析失败: 服务器返回了非 JSON 格式的数据` };
        }
        return { success: false, error: `[API] 请求异常: ${e.message}` };
    }
}

async function callAnthropic(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<APIResult> {
    const url = 'https://api.anthropic.com/v1/messages';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model,
                max_tokens: 4096,
                system: systemPrompt || undefined,
                messages: [{ role: 'user', content: userPrompt }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return { success: false, error: `[Claude] 认证失败 (401): API Key 无效` };
            }
            if (response.status === 429) {
                return { success: false, error: `[Claude] 请求过于频繁 (429): 已触发速率限制，请稍后重试` };
            }
            if (response.status === 400) {
                return { success: false, error: `[Claude] 请求参数错误 (400): ${data.error?.message || '请检查模型名称'}` };
            }

            const errorMsg = data.error?.message || data.message || JSON.stringify(data);
            return { success: false, error: `[Claude] HTTP ${response.status}: ${errorMsg}` };
        }

        if (data.error) {
            return {
                success: false,
                error: `[Claude] API 错误: ${data.error.message || data.error.type || JSON.stringify(data.error)}`
            };
        }

        const content = data.content?.[0]?.text;
        if (!content) {
            return {
                success: false,
                error: `[Claude] 响应格式异常: 未找到生成内容。原始响应: ${JSON.stringify(data).slice(0, 200)}`
            };
        }

        return { success: true, content };

    } catch (e: any) {
        if (e.name === 'TypeError' && e.message.includes('fetch')) {
            return { success: false, error: `[Claude] 网络连接失败: 无法连接到 Anthropic API` };
        }
        return { success: false, error: `[Claude] 请求异常: ${e.message}` };
    }
}

export async function POST(request: Request) {
    try {
        const { prompt, type } = await request.json();

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return NextResponse.json({
                code: 400,
                msg: '请输入内容后再发送',
                data: null
            });
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
            return NextResponse.json({
                code: 500,
                msg: '❌ 未配置 API Key\n\n请前往【AI 设置】页面配置您的 AI 服务提供商和 API Key。',
                data: null
            });
        }

        const prompts = getPrompts(type, prompt);
        let result: APIResult;

        switch (provider) {
            case 'zhipu':
                result = await callZhipu(apiKey, model, prompts.system, prompts.user);
                break;
            case 'openai':
            case 'deepseek':
            case 'qwen':
                result = await callOpenAI(apiKey, model, PROVIDERS[provider]?.baseUrl || baseUrl, prompts.system, prompts.user);
                break;
            case 'custom':
                // Auto-append /chat/completions if missing
                let customUrl = baseUrl;
                if (!customUrl) {
                    return NextResponse.json({
                        code: 500,
                        msg: '❌ 自定义 API 地址未配置\n\n使用自定义 API 时必须在【AI 设置】中填写 API 地址。',
                        data: null
                    });
                }
                if (!customUrl.includes('/chat/completions')) {
                    customUrl = customUrl.replace(/\/$/, '') + '/chat/completions';
                }
                result = await callOpenAI(apiKey, model, customUrl, prompts.system, prompts.user);
                break;
            case 'anthropic':
                result = await callAnthropic(apiKey, model, prompts.system, prompts.user);
                break;
            default:
                result = await callZhipu(apiKey, model, prompts.system, prompts.user);
        }

        if (!result.success) {
            return NextResponse.json({
                code: 500,
                msg: result.error,
                data: null
            });
        }

        return NextResponse.json({
            code: 200,
            msg: 'success',
            data: {
                content: result.content,
                reasoning_content: result.reasoning_content // 深度思考内容
            }
        });

    } catch (error: any) {
        console.error('AI Generate Error:', error);

        let detailedMsg = '❌ AI 生成失败\n\n';

        if (error.message?.includes('JSON')) {
            detailedMsg += '原因: 请求数据格式错误\n';
            detailedMsg += '建议: 检查发送的内容是否包含特殊字符';
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
            detailedMsg += '原因: 网络连接失败\n';
            detailedMsg += '建议: 检查网络连接或 API 服务是否可用';
        } else if (error.message?.includes('timeout')) {
            detailedMsg += '原因: 请求超时\n';
            detailedMsg += '建议: AI 服务响应过慢，请稍后重试';
        } else {
            detailedMsg += `错误详情: ${error.message || '未知错误'}\n`;
            detailedMsg += '建议: 请检查 AI 服务配置是否正确';
        }

        return NextResponse.json({
            code: 500,
            msg: detailedMsg,
            data: null
        });
    }
}

export async function GET() {
    return NextResponse.json({
        code: 200,
        msg: 'success',
        data: { providers: PROVIDERS }
    });
}

