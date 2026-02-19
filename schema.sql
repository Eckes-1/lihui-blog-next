-- Cloudflare D1 Schema

CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    date TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_settings (
    id INTEGER PRIMARY KEY,
    provider TEXT NOT NULL DEFAULT 'zhipu',
    api_key TEXT,
    model TEXT,
    base_url TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS ai_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    api_key TEXT NOT NULL,
    model TEXT,
    base_url TEXT,
    is_active INTEGER DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
);

-- Initial Data
INSERT OR IGNORE INTO posts (slug, title, excerpt, content, date, tags) VALUES 
('hello-world', '你好，世界', '欢迎来到我的全新动态博客！这是一个基于 Next.js 复刻的 Stellar 主题。', '# Hello World\n\n这是 **Cloudflare D1** 数据库驱动的第一篇文章。', '2026-02-01', 'Hexo,Blog');

INSERT OR IGNORE INTO settings (key, value) VALUES ('login_session_duration', '1800');

-- Default AI Setting
INSERT OR IGNORE INTO ai_settings (id, provider, api_key, model, base_url, updated_at) 
VALUES (1, 'zhipu', '', 'glm-4-flash', '', datetime('now'));
