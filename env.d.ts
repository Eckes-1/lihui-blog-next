interface R2Bucket {
    put(key: string, value: any, options?: any): Promise<any>;
    get(key: string): Promise<any>;
}

interface D1Result<T = unknown> {
    results: T[];
    success: boolean;
    meta: any;
    error?: string;
}

interface D1PreparedStatement {
    bind(...args: any[]): D1PreparedStatement;
    first<T = unknown>(colName?: string): Promise<T | null>;
    run<T = unknown>(): Promise<D1Result<T>>;
    all<T = unknown>(): Promise<D1Result<T>>;
    raw<T = unknown>(): Promise<T[]>;
}

interface D1Database {
    prepare(query: string): D1PreparedStatement;
    dump(): Promise<ArrayBuffer>;
    batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
    exec(query: string): Promise<D1Result>;
}

interface CloudflareEnv {
    MY_BUCKET?: R2Bucket;
    DB?: D1Database;
    R2_DOMAIN?: string;
    // GitHub 图床配置
    GITHUB_REPO?: string; // e.g. "username/repo"
    GITHUB_TOKEN?: string;
    GITHUB_BRANCH?: string; // default: "main"
    // 邮件服务
    RESEND_API_KEY?: string;
    RESEND_FROM_EMAIL?: string;
}
