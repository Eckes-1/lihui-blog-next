
import { createClient } from "@libsql/client";

/**
 * 数据库客户端适配器
 * 自动适配 Cloudflare D1 (生产环境) 和 Turso/LibSQL (本地/Node环境)
 */
class DatabaseAdapter {
    private libsqlClient: any = null;

    private getLibSQLClient() {
        if (this.libsqlClient) return this.libsqlClient;

        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;

        // 如果没有配置 Turso，但也没在 CF 环境，抛出友好错误
        if (!url && process.env.NODE_ENV !== 'production') {
            console.warn("⚠️ Warning: TURSO_DATABASE_URL not set. Database operations may fail locally.");
        }

        if (url) {
            this.libsqlClient = createClient({
                url,
                authToken,
            });
        }
        return this.libsqlClient;
    }

    /**
     * 统一执行 SQL 查询
     * @param options { sql: string, args?: any[] | object }
     */
    async execute(options: { sql: string, args?: any }) {
        const { sql, args } = options;

        // 1. 尝试使用 Cloudflare D1
        try {
            // 动态导入以避免在 Node 环境下报错
            // @ts-ignore
            if (process.env.NODE_ENV === 'production') {
                 const { getRequestContext } = await import('@cloudflare/next-on-pages');
                 const env = getRequestContext().env as CloudflareEnv;
            
                 if (env && env.DB) {
                     // D1 模式
                     const stmt = env.DB.prepare(sql);
                     let result;

                     // 处理参数
                     if (args) {
                         if (Array.isArray(args)) {
                             // 位置参数 [1, "test"]
                             result = await stmt.bind(...args).all();
                         } else {
                             // 命名参数 { slug: "test" }
                             if (Object.keys(args).length > 0 && sql.includes(':')) {
                                 const { newSql, newArgs } = this.convertNamedParams(sql, args);
                                 result = await env.DB.prepare(newSql).bind(...newArgs).all();
                             } else {
                                  // 空对象或无匹配
                                  result = await stmt.all();
                             }
                         }
                     } else {
                         result = await stmt.all();
                     }

                     return {
                         rows: result.results || [],
                         columns: [], 
                         toJSON: () => result
                     };
                 }
            }
        } catch (e) {
            // 忽略 CF 环境获取失败，继续尝试本地
            console.log("D1 execution failed or not available, falling back to LibSQL", e);
        }

        // 2. 回退到 Turso / LibSQL
        const client = this.getLibSQLClient();
        if (!client) {
            throw new Error("Database configuration missing. Please set TURSO_DATABASE_URL or configure Cloudflare D1.");
        }
        return client.execute(options);
    }

    // 简单的命名参数转位置参数辅助函数
    private convertNamedParams(sql: string, params: Record<string, any>) {
        const newArgs: any[] = [];
        const newSql = sql.replace(/:(\w+)/g, (match, key) => {
            if (params.hasOwnProperty(key)) {
                newArgs.push(params[key]);
                return '?';
            }
            return match; // 未找到参数，保留原样
        });
        return { newSql, newArgs };
    }
}

export const db = new DatabaseAdapter();
