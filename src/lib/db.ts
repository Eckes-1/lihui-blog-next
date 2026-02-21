
/**
 * 数据库客户端适配器
 * 自动适配 Cloudflare D1 (生产环境) 和 Turso/LibSQL (本地/Node环境)
 */
class DatabaseAdapter {
    private libsqlClient: any = null;

    private async getLibSQLClient() {
        if (this.libsqlClient) return this.libsqlClient;

        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;

        if (!url && process.env.NODE_ENV !== 'production') {
            console.warn("⚠️ Warning: TURSO_DATABASE_URL not set. Database operations may fail locally.");
        }

        if (url) {
            // 动态导入 @libsql/client，避免在 Cloudflare Workers 中加载失败
            const { createClient } = await import("@libsql/client");
            this.libsqlClient = createClient({
                url,
                authToken,
            });
        }
        return this.libsqlClient;
    }

    /**
     * 统一执行 SQL 查询
     */
    async execute(options: string | { sql: string, args?: any }, args?: any) {
        let sql: string;
        let sqlArgs: any;

        if (typeof options === 'string') {
            sql = options;
            sqlArgs = args;
        } else {
            sql = options.sql;
            sqlArgs = options.args;
        }

        // 1. 尝试使用 Cloudflare D1
        try {
            // @ts-ignore
            const { getCloudflareContext } = await import('@opennextjs/cloudflare');
            const { env } = await getCloudflareContext();
            const cfEnv = env as CloudflareEnv;

            if (cfEnv && cfEnv.DB) {
                const stmt = cfEnv.DB.prepare(sql);
                let result;

                if (sqlArgs) {
                    if (Array.isArray(sqlArgs)) {
                        result = await stmt.bind(...sqlArgs).all();
                    } else {
                        if (Object.keys(sqlArgs).length > 0 && sql.includes(':')) {
                            const { newSql, newArgs } = this.convertNamedParams(sql, sqlArgs);
                            result = await cfEnv.DB.prepare(newSql).bind(...newArgs).all();
                        } else {
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
        } catch (e) {
            console.log("D1 not available, falling back to LibSQL", e);
        }

        // 2. 回退到 Turso / LibSQL
        const client = await this.getLibSQLClient();
        if (!client) {
            throw new Error("Database configuration missing. Please set TURSO_DATABASE_URL or configure Cloudflare D1.");
        }
        return client.execute({ sql, args: sqlArgs });
    }

    private convertNamedParams(sql: string, params: Record<string, any>) {
        const newArgs: any[] = [];
        const newSql = sql.replace(/:(\\w+)/g, (match: string, key: string) => {
            if (params.hasOwnProperty(key)) {
                newArgs.push(params[key]);
                return '?';
            }
            return match;
        });
        return { newSql, newArgs };
    }
}

export const db = new DatabaseAdapter();
