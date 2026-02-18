# Cloudflare Pages 部署指南 (全栈版)

本项目已经完全适配 **Cloudflare 全家桶**，包括：
- **Pages**: 静态资源托管与 Edge Runtime 运行环境
- **D1**: Serverless SQLite 数据库
- **R2 / GitHub**: 对象存储 (图床)
- **Workers**: API 路由与后端逻辑

## 1. 准备工作

确保你已经拥有：
- Cloudflare 账号
- GitHub 账号

## 2. 部署步骤

### 步骤 A: 推送代码
将本项目代码推送到你的 GitHub 仓库。

### 步骤 B: 创建 Cloudflare Pages 项目
1. 登录 Cloudflare Dashboard。
2. 进入 **Compute (Workers & Pages)** -> **Pages**。
3. 点击 **Connect to Git**。
4. 选择你的 GitHub 仓库。

### 步骤 C: 构建配置 (关键)
在 "Set up build and deployments" 页面：

- **Framework preset**: `None`
- **Build command**: `npx @cloudflare/next-on-pages@1`
- **Build output directory**: `.vercel/output/static`

### 步骤 D: 创建与绑定数据库 (Cloudflare D1)

1. 在 Cloudflare Dashboard 左侧菜单找到 **D1**，创建一个新的数据库（例如命名为 `blog-db`）。
2. 进入数据库详情页，点击 **Console** 标签页。
3. 复制项目根目录下的 `schema.sql` 文件内容，粘贴到 Console 中并点击 **Execute**。这将创建表结构并写入初始数据。
4. 回到 Pages 项目页面，点击 **Settings** -> **Functions**。
5. 找到 **D1 Database Bindings** 部分，点击 **Add binding**。
6. **Variable name** (变量名) 必须填: `DB`
7. **D1 Database** 选择你刚才创建的 `blog-db`。

### 步骤 E: 配置环境变量
在 **Settings** -> **Environment variables** 中添加：

#### 基础配置
| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXTAUTH_SECRET` | NextAuth 加密密钥 | `your-random-secret` |
| `NEXTAUTH_URL` | 你的生产环境域名 | `https://your-blog.pages.dev` |

#### 邮件服务 (推荐 Resend)
Cloudflare 本身不提供邮件发送服务，推荐使用 Resend (有免费额度) 发送验证码。
如果不配置，验证码将只输出在 **Functions Logs** 中，你需要去后台查看日志才能登录。

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `RESEND_API_KEY` | Resend API Key | `re_123456...` |
| `RESEND_FROM_EMAIL` | 发件人邮箱 (可选) | `onboarding@resend.dev` |

### 步骤 F: 配置图床 (二选一)

**方案 1: GitHub 图床 (免费，无需 R2)**
| 变量名 | 说明 |
|--------|------|
| `GITHUB_REPO` | `username/blog-assets` |
| `GITHUB_TOKEN` | `ghp_xxxxxx` (需 repo 权限) |

**方案 2: Cloudflare R2**
如果使用 R2，请在 **Functions** -> **R2 Bucket Bindings** 中绑定变量名 `MY_BUCKET`。

## 3. 重新部署
配置完成后，进入 **Deployments**，点击 **Retry deployment**。

## 4. 本地开发
本地开发建议继续使用 Turso 或 SQLite，因为 D1 的本地模拟需要 Wrangler 环境。
如果需要在本地连接远程 D1，可以使用 `wrangler d1 execute ...` 命令，但这不支持实时应用连接。
建议在 `.env.local` 中配置 `TURSO_DATABASE_URL` 用于本地开发。
