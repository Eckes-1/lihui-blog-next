
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Upload, Image as ImageIcon, Clock, Type, Layout, Loader2 } from 'lucide-react';

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

export default function SettingsPage() {
    const router = useRouter();
    const [loginBgUrl, setLoginBgUrl] = useState('');
    const [bgOpacity, setBgOpacity] = useState(80); // Default 80%
    const [formOpacity, setFormOpacity] = useState(100); // Default 100%
    const [sessionDuration, setSessionDuration] = useState(1800); // Default 30 mins (seconds)
    const [loginTitle, setLoginTitle] = useState("后台登录");
    const [loginSubtitle, setLoginSubtitle] = useState("请输入详细信息以完成安全登录");

    // Admin Background States
    const [adminBgUrl, setAdminBgUrl] = useState('');
    const [adminBgOpacity, setAdminBgOpacity] = useState(80); // Default 80% (Mask opacity)
    const [adminContentOpacity, setAdminContentOpacity] = useState(90); // Default 90% (Content opacity)
    const [adminSidebarOpacity, setAdminSidebarOpacity] = useState(90); // Default 90% (Sidebar opacity)

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                if (data?.login_bg_url) setLoginBgUrl(data.login_bg_url);
                if (data?.login_bg_opacity !== undefined) setBgOpacity(Number(data.login_bg_opacity));
                if (data?.login_form_opacity !== undefined) setFormOpacity(Number(data.login_form_opacity));
                if (data?.login_session_duration !== undefined) setSessionDuration(Number(data.login_session_duration));
                if (data?.login_title) setLoginTitle(data.login_title);
                if (data?.login_title) setLoginTitle(data.login_title);
                if (data?.login_subtitle) setLoginSubtitle(data.login_subtitle);

                if (data?.admin_bg_url) setAdminBgUrl(data.admin_bg_url);
                if (data?.admin_bg_opacity !== undefined) setAdminBgOpacity(Number(data.admin_bg_opacity));
                if (data?.admin_content_opacity !== undefined) setAdminContentOpacity(Number(data.admin_content_opacity));
                if (data?.admin_sidebar_opacity !== undefined) setAdminSidebarOpacity(Number(data.admin_sidebar_opacity));
            })
            .catch(() => showMessage('error', '无法加载设置'))
            .finally(() => setLoading(false));
    }, []);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = [
                { key: 'login_bg_url', value: loginBgUrl },
                { key: 'login_bg_opacity', value: String(bgOpacity) },
                { key: 'login_form_opacity', value: String(formOpacity) },
                { key: 'login_session_duration', value: String(sessionDuration) },
                { key: 'login_title', value: loginTitle },
                { key: 'login_subtitle', value: loginSubtitle },
                { key: 'admin_bg_url', value: adminBgUrl },
                { key: 'admin_bg_opacity', value: String(adminBgOpacity) },
                { key: 'admin_content_opacity', value: String(adminContentOpacity) },
                { key: 'admin_sidebar_opacity', value: String(adminSidebarOpacity) }
            ];

            await Promise.all(updates.map(item =>
                fetch('/api/admin/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                })
            ));

            showMessage('success', '设置保存成功！');
            router.refresh();
        } catch (err) {
            showMessage('error', '保存失败，请重试');
        } finally {
            setSaving(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.url) {
                setLoginBgUrl(data.url);
                showMessage('success', '图片上传成功');
            } else {
                throw new Error('Upload failed');
            }
        } catch (err) {
            showMessage('error', '图片上传失败');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleAdminUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.url) {
                setAdminBgUrl(data.url);
                showMessage('success', '背景图上传成功');
            } else {
                throw new Error('Upload failed');
            }
        } catch (err) {
            showMessage('error', '图片上传失败');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleNumberChange = (val: string, setter: (n: number) => void) => {
        let n = parseInt(val);
        if (isNaN(n)) n = 0;
        if (n < 0) n = 0;
        if (n > 100) n = 100;
        setter(n);
    };

    // Duration options
    const durationOptions = [
        { label: '30 分钟', value: 1800 },
        { label: '1 小时', value: 3600 },
        { label: '12 小时', value: 43200 },
        { label: '24 小时 (1天)', value: 86400 },
        { label: '7 天', value: 604800 },
        { label: '30 天', value: 2592000 },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Loader2 size={32} className="text-blue-500" color="#3b82f6" />
                </motion.div>
                <span style={{ marginLeft: '10px', color: '#64748b' }}>正在加载系统设置...</span>
            </div>
        );
    }

    return (
        <motion.div initial="hidden" animate="show" variants={containerVariants}>
            <div className="settings-page">
                <motion.div variants={itemVariants}>
                    <header className="page-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Layout size={28} className="text-primary" style={{ color: 'var(--admin-primary)' }} />
                            <div>
                                <h1>系统设置</h1>
                                <p>管理全局配置和界面外观</p>
                            </div>
                        </div>
                    </header>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <div className="card">
                        <div className="card-header" style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '4px', height: '16px', background: 'var(--admin-primary)', borderRadius: '2px' }}></span>
                                <h2>登录页设置</h2>
                            </div>
                        </div>

                        <div className="card-body">
                            {/* Session Duration Setting */}
                            <div className="form-group setting-row">
                                <div>
                                    <label>登录状态保持时间</label>
                                    <p className="hint">设置用户登录后多久自动过期需要重新登录</p>
                                </div>
                                <div className="control-wrap">
                                    <select
                                        className="select-input"
                                        value={sessionDuration}
                                        onChange={(e) => setSessionDuration(Number(e.target.value))}
                                    >
                                        {durationOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>登录页标题</label>
                                <input
                                    type="text"
                                    className="input-text"
                                    value={loginTitle}
                                    onChange={e => setLoginTitle(e.target.value)}
                                    placeholder="例如：后台登录"
                                    style={{ width: '100%', maxWidth: '480px' }}
                                />
                                <p className="hint" style={{ marginTop: '8px' }}>显示在登录页面的大标题</p>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>副标题 / 提示语</label>
                                <input
                                    type="text"
                                    className="input-text"
                                    value={loginSubtitle}
                                    onChange={e => setLoginSubtitle(e.target.value)}
                                    placeholder="例如：请输入详细信息以完成安全登录"
                                    style={{ width: '100%', maxWidth: '480px' }}
                                />
                                <p className="hint" style={{ marginTop: '8px' }}>显示在标题下方的小字提示</p>
                            </div>

                            <hr className="divider" />

                            <div className="form-group">
                                <label>登录页背景（图片或视频）</label>

                                <div className="upload-area">
                                    <div className="preview-box">
                                        {loginBgUrl ? (
                                            <>
                                                {/* Background Layer */}
                                                {/\.(mp4|webm|ogg)$/i.test(loginBgUrl) ? (
                                                    <video src={loginBgUrl} className="preview-video" autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <img src={loginBgUrl} alt="Preview" className="preview-img" onError={(e) => (e.currentTarget.src = '')} />
                                                )}

                                                {/* Global Mask Layer */}
                                                <div className="preview-overlay" style={{ background: `rgba(255,255,255, ${bgOpacity / 100})` }}></div>

                                                {/* Layout Layer: Simulating Left(70%) + Right(Auto) */}
                                                <div className="preview-layout">
                                                    <div className="preview-left"></div>
                                                    <div className="preview-right" style={{ background: `rgba(255,255,255, ${formOpacity / 100})` }}>
                                                        {/* Mock Form Content */}
                                                        <div className="mock-form-card" style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <div className="mock-title" style={{ fontSize: '8px', fontWeight: 'bold', color: '#333' }}>{loginTitle}</div>
                                                            <div className="mock-subtitle" style={{ fontSize: '6px', color: '#666', marginBottom: '4px' }}>{loginSubtitle.substring(0, 10)}...</div>
                                                            <div className="mock-input"></div>
                                                            <div className="mock-input"></div>
                                                            <div className="mock-btn"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="placeholder">暂无背景图</div>
                                        )}
                                    </div>

                                    {/* Left View Opacity Slider */}
                                    <div className="opacity-control" style={{ marginTop: '10px' }}>
                                        <label className="opacity-label">
                                            <span>背景图遮罩不透明度: {bgOpacity}%</span>
                                            <span className="opacity-hint">(0 = 清晰, 100 = 纯白)</span>
                                        </label>
                                        <div className="slider-row">
                                            <input
                                                type="range"
                                                min="0" max="100"
                                                value={bgOpacity}
                                                onChange={(e) => setBgOpacity(Number(e.target.value))}
                                                className="opacity-slider"
                                            />
                                            <input
                                                type="number"
                                                min="0" max="100"
                                                value={bgOpacity}
                                                onChange={(e) => handleNumberChange(e.target.value, setBgOpacity)}
                                                className="opacity-number-input"
                                            />
                                        </div>
                                    </div>

                                    {/* Form Opacity Slider */}
                                    <div className="opacity-control" style={{ marginTop: '10px' }}>
                                        <label className="opacity-label">
                                            <span>表单区域背景不透明度: {formOpacity}%</span>
                                            <span className="opacity-hint">(0 = 透明, 100 = 纯白)</span>
                                        </label>
                                        <div className="slider-row">
                                            <input
                                                type="range"
                                                min="0" max="100"
                                                value={formOpacity}
                                                onChange={(e) => setFormOpacity(Number(e.target.value))}
                                                className="opacity-slider"
                                            />
                                            <input
                                                type="number"
                                                min="0" max="100"
                                                value={formOpacity}
                                                onChange={(e) => handleNumberChange(e.target.value, setFormOpacity)}
                                                className="opacity-number-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="actions" style={{ marginTop: '16px' }}>
                                        <label className={`btn btn-secondary ${uploading ? 'disabled' : ''}`}>
                                            {uploading ? '上传中...' : '上传文件'}
                                            <input type="file" hidden accept="image/*,video/*" onChange={handleUpload} disabled={uploading} />
                                        </label>

                                        <input
                                            type="text"
                                            className="input-text"
                                            value={loginBgUrl}
                                            onChange={(e) => setLoginBgUrl(e.target.value)}
                                            placeholder="或直接输入图片 URL"
                                        />
                                    </div>
                                    <p className="hint" style={{ marginTop: '8px' }}>支持图片 (JPG, PNG) 或视频 (MP4, WebM)。建议尺寸 1920x1080。</p>
                                </div>
                            </div>

                            <div className="submit-row">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="spin" size={16} style={{ marginRight: 8 }} />
                                            保存中...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} style={{ marginRight: 8 }} />
                                            保存更改
                                        </>
                                    )}
                                </button>

                                {message.text && (
                                    <span className={`message ${message.type}`}>
                                        {message.text}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <div className="card" style={{ marginTop: '24px' }}>
                        <div className="card-header" style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '4px', height: '16px', background: 'var(--admin-primary)', borderRadius: '2px' }}></span>
                                <h2>管理员后台背景设置</h2>
                            </div>
                        </div>

                        <div className="card-body">
                            <div className="form-group">
                                <label>后台全局背景（图片或视频）</label>

                                <div className="upload-area">
                                    <div className="preview-box">
                                        {adminBgUrl ? (
                                            <>
                                                {/* Background Layer */}
                                                {/\.(mp4|webm|ogg)$/i.test(adminBgUrl) ? (
                                                    <video src={adminBgUrl} className="preview-video" autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <img src={adminBgUrl} alt="Preview" className="preview-img" onError={(e) => (e.currentTarget.src = '')} />
                                                )}

                                                {/* Global Mask Layer */}
                                                <div className="preview-overlay" style={{ background: `rgba(255,255,255, ${adminBgOpacity / 100})` }}></div>

                                                {/* Layout Layer Mockup */}
                                                <div className="preview-layout" style={{ display: 'flex' }}>
                                                    {/* Sidebar Mockup */}
                                                    <div style={{ width: '25%', height: '100%', background: `rgba(255,255,255,${adminSidebarOpacity / 100})`, borderRight: '1px solid rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px' }}>
                                                        <div style={{ width: '80%', height: '20px', background: 'var(--admin-primary)', borderRadius: '4px', opacity: 0.8 }}></div>
                                                        <div style={{ width: '100%', height: '10px', background: '#cbd5e1', borderRadius: '2px', marginTop: '10px' }}></div>
                                                        <div style={{ width: '100%', height: '10px', background: '#cbd5e1', borderRadius: '2px' }}></div>
                                                        <div style={{ width: '100%', height: '10px', background: '#cbd5e1', borderRadius: '2px' }}></div>
                                                    </div>
                                                    {/* Content Mockup */}
                                                    <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                        <div style={{ width: '100%', height: '30px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                                                            <div style={{ width: '100px', height: '15px', background: '#cbd5e1', borderRadius: '2px' }}></div>
                                                        </div>
                                                        {/* Main Content Card Mockup */}
                                                        <div style={{ flex: 1, background: `rgba(255,255,255, ${adminContentOpacity / 100})`, borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)', padding: '12px' }}>
                                                            <div style={{ width: '40%', height: '15px', background: '#cbd5e1', borderRadius: '2px', marginBottom: '10px' }}></div>
                                                            <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '2px' }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="placeholder">暂无背景图</div>
                                        )}
                                    </div>

                                    {/* Mask Opacity Slider */}
                                    <div className="opacity-control" style={{ marginTop: '10px' }}>
                                        <label className="opacity-label">
                                            <span>背景遮罩不透明度: {adminBgOpacity}%</span>
                                            <span className="opacity-hint">(防止背景太花，0 = 清晰, 100 = 纯白)</span>
                                        </label>
                                        <div className="slider-row">
                                            <input
                                                type="range"
                                                min="0" max="100"
                                                value={adminBgOpacity}
                                                onChange={(e) => setAdminBgOpacity(Number(e.target.value))}
                                                className="opacity-slider"
                                            />
                                            <input
                                                type="number"
                                                min="0" max="100"
                                                value={adminBgOpacity}
                                                onChange={(e) => handleNumberChange(e.target.value, setAdminBgOpacity)}
                                                className="opacity-number-input"
                                            />
                                        </div>
                                    </div>

                                    {/* Content Opacity Slider */}
                                    <div className="opacity-control" style={{ marginTop: '10px' }}>
                                        <label className="opacity-label">
                                            <span>内容卡片不透明度: {adminContentOpacity}%</span>
                                            <span className="opacity-hint">(0 = 透明, 100 = 纯白)</span>
                                        </label>
                                        <div className="slider-row">
                                            <input
                                                type="range"
                                                min="0" max="100"
                                                value={adminContentOpacity}
                                                onChange={(e) => setAdminContentOpacity(Number(e.target.value))}
                                                className="opacity-slider"
                                            />
                                            <input
                                                type="number"
                                                min="0" max="100"
                                                value={adminContentOpacity}
                                                onChange={(e) => handleNumberChange(e.target.value, setAdminContentOpacity)}
                                                className="opacity-number-input"
                                            />
                                        </div>
                                    </div>

                                    {/* Sidebar Opacity Slider */}
                                    <div className="opacity-control" style={{ marginTop: '10px' }}>
                                        <label className="opacity-label">
                                            <span>侧边栏不透明度: {adminSidebarOpacity}%</span>
                                            <span className="opacity-hint">(0 = 透明, 100 = 纯白)</span>
                                        </label>
                                        <div className="slider-row">
                                            <input
                                                type="range"
                                                min="0" max="100"
                                                value={adminSidebarOpacity}
                                                onChange={(e) => setAdminSidebarOpacity(Number(e.target.value))}
                                                className="opacity-slider"
                                            />
                                            <input
                                                type="number"
                                                min="0" max="100"
                                                value={adminSidebarOpacity}
                                                onChange={(e) => handleNumberChange(e.target.value, setAdminSidebarOpacity)}
                                                className="opacity-number-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="actions" style={{ marginTop: '16px' }}>
                                        <label className={`btn btn-secondary ${uploading ? 'disabled' : ''}`}>
                                            {uploading ? '上传中...' : '上传文件'}
                                            <input type="file" hidden accept="image/*,video/*" onChange={handleAdminUpload} disabled={uploading} />
                                        </label>

                                        <input
                                            type="text"
                                            className="input-text"
                                            value={adminBgUrl}
                                            onChange={(e) => setAdminBgUrl(e.target.value)}
                                            placeholder="或直接输入图片 URL"
                                        />
                                    </div>
                                    <p className="hint" style={{ marginTop: '8px' }}>支持图片 (JPG, PNG) 或视频 (MP4, WebM)。将应用到整个管理后台。</p>
                                </div>
                            </div>

                            <div className="submit-row">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="spin" size={16} style={{ marginRight: 8 }} />
                                            保存中...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} style={{ marginRight: 8 }} />
                                            保存更改
                                        </>
                                    )}
                                </button>

                                {message.text && (
                                    <span className={`message ${message.type}`}>
                                        {message.text}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <style jsx>{`
                .settings-page {
                    padding: 24px;
                    max-width: 800px;
                    margin: 0 auto;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }
                .page-header {
                    margin-bottom: 32px;
                }
                .page-header h1 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 8px 0;
                }
                .page-header p {
                    color: #64748b;
                    font-size: 14px;
                }
                
                .card {
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .card:hover {
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                }
                .card-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .card-header h2 {
                    font-size: 18px;
                    font-weight: 600;
                    color: #334155;
                    margin: 0;
                }
                .card-body {
                    padding: 24px;
                }
                
                .form-group {
                    margin-bottom: 24px;
                }
                .form-group label {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                    color: #475569;
                    margin-bottom: 8px;
                }
                .setting-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 24px;
                }
                
                @media (max-width: 768px) {
                    .setting-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                    }
                    .control-wrap {
                        width: 100%;
                    }
                    .settings-page {
                        padding: 16px;
                    }
                }

                .control-wrap {
                    min-width: 200px;
                }
                .select-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    font-size: 14px;
                    outline: none;
                    background: #fff;
                    cursor: pointer;
                }
                .select-input:focus { border-color: #3b82f6; }
                .divider {
                    border: none;
                    border-top: 1px solid #f1f5f9;
                    margin: 24px 0;
                }
                
                .upload-area {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .preview-box {
                    width: 100%;
                    height: 300px;
                    background: #f8fafc;
                    border: 2px dashed #cbd5e1;
                    border-radius: 8px;
                    overflow: hidden;
                    display: flex; /* Flex layout */
                    position: relative;
                }
                .preview-img {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .preview-overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    pointer-events: none;
                    z-index: 1; /* Mask on top of image */
                }
                .preview-layout {
                    position: absolute;
                    inset: 0;
                    z-index: 2; /* Layout on top of mask */
                    display: flex;
                    width: 100%;
                    height: 100%;
                }
                .preview-left {
                    width: 70%;
                    height: 100%;
                    /* Transparent left side */
                }
                .preview-right {
                    flex: 1; /* Occupy remaining right space */
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    /* Background is set inline */
                }
                .placeholder {
                    color: #94a3b8;
                    font-size: 14px;
                    z-index: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .mock-form-card {
                    width: 80%;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .mock-title { width: 60%; height: 8px; background: #cbd5e1; border-radius: 4px; margin-bottom: 8px; }
                .mock-input { width: 100%; height: 20px; background: #e2e8f0; border-radius: 4px; }
                .mock-btn { width: 100%; height: 24px; background: #3b82f6; border-radius: 4px; margin-top: 4px; opacity: 0.8; }
                
                .opacity-control {
                    background: #f8fafc;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }
                .opacity-label {
                    display: flex;
                    justify-content: space-between;
                    font-size: 13px;
                    margin-bottom: 8px;
                    width: 100%;
                }
                .opacity-hint {
                    color: #999;
                }
                .slider-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .opacity-slider {
                    flex: 1;
                    cursor: pointer;
                    height: 6px;
                    background: #cbd5e1;
                    border-radius: 3px;
                    appearance: none;
                }
                .opacity-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #3b82f6;
                    border-radius: 50%;
                    cursor: pointer;
                }
                .opacity-number-input {
                    width: 60px;
                    padding: 4px 8px;
                    border: 1px solid #cbd5e1;
                    border-radius: 4px;
                    font-size: 14px;
                    text-align: center;
                    outline: none;
                }
                .opacity-number-input:focus {
                    border-color: #3b82f6;
                }

                .actions {
                    display: flex;
                    gap: 12px;
                }
                .input-text {
                    flex: 1;
                    padding: 8px 12px;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .input-text:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59,130,246,0.1);
                }
                
                .btn {
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .btn-primary {
                    background: #3b82f6;
                    color: white;
                }
                .btn-primary:hover {
                    background: #2563eb;
                }
                .btn-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                .btn-secondary {
                    background: #fff;
                    border: 1px solid #cbd5e1;
                    color: #475569;
                }
                .btn-secondary:hover {
                    background: #f8fafc;
                    border-color: #94a3b8;
                }
                .btn.disabled {
                    opacity: 0.6;
                    pointer-events: none;
                }
                
                .hint {
                    font-size: 12px;
                    color: #94a3b8;
                    margin: 0;
                }
                
                .submit-row {
                    margin-top: 32px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding-top: 20px;
                    border-top: 1px solid #f1f5f9;
                }
                
                .message {
                    font-size: 14px;
                    font-weight: 500;
                }
                .message.success { color: #10b981; }
                .message.error { color: #ef4444; }
                
                .preview-overlay {
                    transition: background 0.3s;
                }
                
                .loading {
                    padding: 40px;
                    text-align: center;
                    color: #64748b;
                }
                input[type=file] {
                    display: none;
                }
            `}</style>
            </div>
        </motion.div>
    );
}
