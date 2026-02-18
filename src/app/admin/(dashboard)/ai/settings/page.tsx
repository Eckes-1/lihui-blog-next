"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, RefreshCw, Eye, EyeOff } from "lucide-react";

interface AISettings {
    provider: string;
    model: string;
    api_key: string;
    base_url: string;
}

export default function AISettingsPage() {
    const [settings, setSettings] = useState<AISettings>({
        provider: "zhipu",
        model: "",
        api_key: "",
        base_url: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fetchingModels, setFetchingModels] = useState(false);
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [showApiKey, setShowApiKey] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);
    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/ai/settings");
            if (res.ok) {
                const json = await res.json();
                if (json.data) {
                    setSettings(json.data);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchModels = async () => {
        if (!settings.api_key) {
            alert("请先填写 API Key");
            return;
        }
        setFetchingModels(true);
        try {
            const res = await fetch("/api/ai/models", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: settings.provider,
                    api_key: settings.api_key,
                    base_url: settings.base_url
                })
            });
            const data = await res.json();
            if (data.code === 200 && Array.isArray(data.data)) {
                setAvailableModels(data.data);
                // 如果当前没有填模型，自动填入第一个
                if (!settings.model && data.data.length > 0) {
                    setSettings(prev => ({ ...prev, model: data.data[0] }));
                }
                alert(`成功获取 ${data.data.length} 个模型，请在输入框中选择`);
            } else {
                alert("获取失败: " + (data.msg || JSON.stringify(data)));
            }
        } catch (error) {
            console.error(error);
            alert("请求失败，请检查网络或配置");
        } finally {
            setFetchingModels(false);
        }
    };
    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/ai/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                alert("保存成功");
            } else {
                alert("保存失败");
            }
        } catch (error) {
            console.error(error);
            alert("错误");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>加载中...</div>;

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1>AI 服务设置</h1>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? "保存中..." : "保存设置"}
                </button>
            </header>

            <div style={{ maxWidth: '600px', background: 'var(--admin-card)', padding: '2rem', borderRadius: '12px', boxSizing: 'border-box', border: '1px solid var(--admin-border)' }}>
                {/* Form fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            默认服务商 (Provider)
                        </label>
                        <select
                            className="form-input"
                            style={{ height: '42px' }}
                            value={settings.provider}
                            onChange={(e) => setSettings({ ...settings, provider: e.target.value })}
                        >
                            <option value="zhipu">智谱 AI (Zhipu)</option>
                            <option value="openai">OpenAI</option>
                            <option value="anthropic">Anthropic</option>
                            <option value="custom">自定义 (Custom)</option>
                        </select>
                        <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-sub)', marginTop: '0.5rem' }}>
                            系统生成内容时默认使用的服务商。
                        </p>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            默认模型 (Model)
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                className="form-input"
                                value={settings.model}
                                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                                placeholder="例如：glm-4-flash, gpt-4o"
                                list="model-options"
                            />
                            <button
                                type="button"
                                onClick={fetchModels}
                                disabled={fetchingModels}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: '0 12px', border: '1px solid var(--admin-border)',
                                    borderRadius: '8px', background: 'var(--admin-hover)',
                                    cursor: fetchingModels ? 'not-allowed' : 'pointer',
                                    color: 'var(--admin-text-main)'
                                }}
                                title="自动获取可用模型"
                            >
                                <RefreshCw className={fetchingModels ? "animate-spin" : ""} size={18} />
                            </button>
                        </div>
                        <datalist id="model-options">
                            {availableModels.map(m => (
                                <option key={m} value={m} />
                            ))}
                        </datalist>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            API Key
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                className="form-input"
                                type={showApiKey ? "text" : "password"}
                                value={settings.api_key}
                                onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
                                placeholder="sk-..."
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: '0 12px', border: '1px solid var(--admin-border)',
                                    borderRadius: '8px', background: 'var(--admin-hover)',
                                    cursor: 'pointer',
                                    color: 'var(--admin-text-main)',
                                    minWidth: '44px'
                                }}
                                title={showApiKey ? "隐藏 API Key" : "显示 API Key"}
                            >
                                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            API Base URL
                        </label>
                        <input
                            className="form-input"
                            value={settings.base_url}
                            onChange={(e) => setSettings({ ...settings, base_url: e.target.value })}
                            placeholder="例如：https://open.bigmodel.cn/api/paas/v4/"
                        />
                        <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-sub)', marginTop: '0.5rem' }}>
                            如果留空，将使用服务商默认地址。
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}
