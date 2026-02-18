"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, Edit, CheckCircle, XCircle, Zap, Loader2, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIConfig {
    id: string;
    name: string;
    provider: string; // 'custom', 'openai', etc.
    model: string;
    api_key: string;
    base_url: string;
    isEnabled: boolean;
}

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const modalOverlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
};

const modalContentVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, damping: 25, stiffness: 300 } },
    exit: { opacity: 0, y: 50, scale: 0.95 }
};

// Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
    <motion.div
        initial={{ opacity: 0, y: -50, x: "-50%" }}
        animate={{ opacity: 1, y: 20, x: "-50%" }}
        exit={{ opacity: 0, y: -50, x: "-50%" }}
        onClick={onClose}
        style={{
            position: 'fixed', top: 0, left: '50%', zIndex: 200,
            background: type === 'success' ? '#10b981' : '#ef4444',
            color: 'white', padding: '10px 20px', borderRadius: '30px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500
        }}
    >
        {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
        {message}
    </motion.div>
);

export default function AIConfigsPage() {
    const [configs, setConfigs] = useState<AIConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' } | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [showApiKey, setShowApiKey] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<AIConfig>>({
        name: "",
        provider: "custom",
        model: "",
        api_key: "",
        base_url: "",
        isEnabled: false
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await fetch("/api/ai/configs");
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.data)) {
                    setConfigs(data.data);
                } else if (Array.isArray(data)) {
                    setConfigs(data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch configs", error);
            showToast("获取配置列表失败", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("确定要删除这个配置吗？")) return;
        try {
            const res = await fetch(`/api/ai/configs?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchConfigs();
                showToast("删除成功");
            }
        } catch (error) {
            console.error(error);
            showToast("删除失败", "error");
        }
    };

    const handleToggle = async (config: AIConfig) => {
        if (togglingId) return; // Prevent double click
        setTogglingId(config.id);
        await handleSave({ ...config, isEnabled: !config.isEnabled }, true);
        setTogglingId(null);
    };

    const handleSave = async (data: Partial<AIConfig>, isToggle = false) => {
        try {
            const method = data.id ? "PUT" : "POST";
            const res = await fetch("/api/ai/configs", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                if (!isToggle) setShowModal(false);
                fetchConfigs();
                if (!isToggle) {
                    setEditingConfig(null);

                    setFormData({
                        name: "", provider: "custom", model: "", api_key: "", base_url: "", isEnabled: false
                    });
                    setShowApiKey(false);
                }
                showToast(isToggle ? (data.isEnabled ? "已启用" : "已禁用") : "保存成功");
            } else {
                showToast("保存失败，请重试", "error");
            }
        } catch (error) {
            console.error(error);
            const errMsg = error instanceof Error ? error.message : '未知错误';
            showToast(`保存出错：${errMsg}`, "error");
        }
    };

    const openModal = (config?: AIConfig) => {
        if (config) {
            setEditingConfig(config);
            setFormData(config);
        } else {
            setEditingConfig(null);
            setFormData({
                name: "",
                provider: "custom",
                model: "",
                api_key: "",
                base_url: "",
                isEnabled: false
            });
        }
        setShowApiKey(false);
        setShowModal(true);
    };

    const testConnection = async () => {
        if (!formData.api_key) {
            showToast("请先填写 API Key", "error");
            return;
        }

        setIsTesting(true);

        try {
            const res = await fetch("/api/ai/models", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: formData.provider,
                    api_key: formData.api_key,
                    base_url: formData.base_url
                })
            });

            const data = await res.json();

            if (res.ok && data.code === 200) {
                showToast(`连接成功！可用模型: ${Array.isArray(data.data) ? data.data.length : 0}`, "success");
            } else {
                showToast(`连接失败：${data.msg || data.error || '未知错误'}`, "error");
            }
        } catch (e: any) {
            console.error(e);
            const errMsg = e.message === 'Failed to fetch' ? '网络错误，请检查网络连接' : e.message;
            showToast(`连接错误：${errMsg}`, "error");
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="admin-page" style={{ position: 'relative' }}>
            <AnimatePresence>
                {toast && (
                    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                )}
            </AnimatePresence>

            <header className="admin-header">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    API 配置管理
                </motion.h1>
                <motion.button
                    className="btn-primary"
                    onClick={() => openModal()}
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Plus size={18} /> 添加配置
                </motion.button>
            </header>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                        <Zap size={32} className="text-blue-500 opacity-50" />
                    </motion.div>
                </div>
            ) : (
                <motion.div
                    className="table-container"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>配置名称</th>
                                <th>服务商</th>
                                <th>模型</th>
                                <th>API Key</th>
                                <th>API 地址</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {configs.map((config) => (
                                <motion.tr key={config.id} variants={itemVariants} layoutId={config.id}>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{config.name}</div>
                                    </td>
                                    <td>{config.provider}</td>
                                    <td>
                                        <motion.span
                                            whileHover={{ scale: 1.1 }}
                                            style={{
                                                background: '#e0f2fe', color: '#0284c7',
                                                padding: '2px 8px', borderRadius: '4px', fontSize: '12px',
                                                display: 'inline-block'
                                            }}
                                        >
                                            {config.model}
                                        </motion.span>
                                    </td>
                                    <td>{config.api_key ? `${config.api_key.substring(0, 4)}****${config.api_key.substring(config.api_key.length - 4)}` : '-'}</td>
                                    <td style={{ fontSize: '12px', color: '#64748b' }}>{config.base_url}</td>
                                    <td>
                                        {config.isEnabled ? (
                                            <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <CheckCircle size={14} /> 已启用
                                            </span>
                                        ) : (
                                            <span style={{ color: '#94a3b8' }}>未启用</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {/* Toggle Switch */}
                                            <div
                                                onClick={() => handleToggle(config)}
                                                style={{
                                                    width: '44px', height: '24px',
                                                    background: config.isEnabled ? '#10b981' : '#e2e8f0',
                                                    borderRadius: '24px', display: 'flex', alignItems: 'center',
                                                    padding: '2px', cursor: togglingId ? 'wait' : 'pointer',
                                                    justifyContent: config.isEnabled ? 'flex-end' : 'flex-start',
                                                    transition: 'background 0.3s ease',
                                                    opacity: togglingId === config.id ? 0.7 : 1
                                                }}
                                                title={config.isEnabled ? "点击禁用" : "点击启用"}
                                            >
                                                <motion.div
                                                    layout
                                                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                                                    style={{
                                                        width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}
                                                >
                                                    {togglingId === config.id && (
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                        >
                                                            <Loader2 size={12} color={config.isEnabled ? '#10b981' : '#94a3b8'} />
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            </div>

                                            {/* Edit Button */}
                                            <motion.button
                                                onClick={() => openModal(config)}
                                                whileHover={{ scale: 1.1, backgroundColor: '#eff6ff', color: '#2563eb' }}
                                                whileTap={{ scale: 0.9 }}
                                                style={{
                                                    border: 'none', background: 'transparent', cursor: 'pointer',
                                                    color: '#64748b', padding: '6px', borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                                title="编辑"
                                            >
                                                <Edit size={18} />
                                            </motion.button>

                                            {/* Delete Button */}
                                            <motion.button
                                                onClick={() => handleDelete(config.id)}
                                                whileHover={{ scale: 1.1, backgroundColor: '#fef2f2', color: '#ef4444' }}
                                                whileTap={{ scale: 0.9 }}
                                                style={{
                                                    border: 'none', background: 'transparent', cursor: 'pointer',
                                                    color: '#94a3b8', padding: '6px', borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                                title="删除"
                                            >
                                                <Trash2 size={18} />
                                            </motion.button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {configs.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                        暂无配置，请点击右上角添加
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </motion.div>
            )}

            {/* Modal */}
            {typeof document !== 'undefined' && showModal && createPortal(
                <AnimatePresence>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={modalOverlayVariants}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        <motion.div
                            variants={modalContentVariants}
                            style={{
                                background: 'var(--admin-card)', padding: '2rem', borderRadius: '16px',
                                width: '500px', maxWidth: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                border: '1px solid var(--admin-border)',
                                color: 'var(--admin-text-main)'
                            }}
                        >
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
                                {editingConfig ? '编辑配置' : '添加配置'}
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>配置名称</label>
                                    <input
                                        className="form-input"
                                        value={formData.name || ""}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="例如：GPT-4 Production"
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>服务商</label>
                                        <select
                                            className="form-input"
                                            value={formData.provider}
                                            onChange={e => setFormData({ ...formData, provider: e.target.value })}
                                        >
                                            <option value="custom">自定义 (OpenAI Compatible)</option>
                                            <option value="openai">OpenAI</option>
                                            <option value="anthropic">Anthropic</option>
                                            <option value="zhipu">智谱 AI</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>模型名称</label>
                                        <input
                                            className="form-input"
                                            value={formData.model || ""}
                                            onChange={e => setFormData({ ...formData, model: e.target.value })}
                                            placeholder="gpt-4o, claude-3-5..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>API Key</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            className="form-input"
                                            value={formData.api_key || ""}
                                            onChange={e => setFormData({ ...formData, api_key: e.target.value })}
                                            type={showApiKey ? "text" : "password"}
                                            placeholder="sk-..."
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            style={{
                                                background: 'var(--admin-bg)',
                                                border: '1px solid var(--admin-border)',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                color: 'var(--admin-text-main)',
                                                padding: '0 10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minWidth: '40px'
                                            }}
                                            title={showApiKey ? "隐藏 API Key" : "显示 API Key"}
                                        >
                                            {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>API Base URL</label>
                                    <input
                                        className="form-input"
                                        value={formData.base_url || ""}
                                        onChange={e => setFormData({ ...formData, base_url: e.target.value })}
                                        placeholder="https://api.openai.com/v1"
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                                    <motion.button
                                        id="test-conn-btn"
                                        onClick={testConnection}
                                        disabled={isTesting}
                                        whileHover={!isTesting ? { scale: 1.02, backgroundColor: '#f1f5f9' } : {}}
                                        whileTap={!isTesting ? { scale: 0.98 } : {}}
                                        style={{
                                            padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                                            background: isTesting ? '#f1f5f9' : '#f8fafc',
                                            cursor: isTesting ? 'wait' : 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            color: isTesting ? '#94a3b8' : '#0f172a', fontWeight: 500,
                                            opacity: isTesting ? 0.8 : 1
                                        }}
                                    >
                                        {isTesting ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            >
                                                <Loader2 size={16} />
                                            </motion.div>
                                        ) : (
                                            <Zap size={16} fill="currentColor" className="text-yellow-500" />
                                        )}
                                        {isTesting ? "测试中..." : "测试连接"}
                                    </motion.button>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <motion.button
                                            onClick={() => setShowModal(false)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            style={{
                                                padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #e5e7eb',
                                                background: 'white', cursor: 'pointer',
                                                color: '#1f2937'
                                            }}
                                        >
                                            取消
                                        </motion.button>
                                        <motion.button
                                            className="btn-primary"
                                            onClick={() => handleSave(formData)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            保存
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
