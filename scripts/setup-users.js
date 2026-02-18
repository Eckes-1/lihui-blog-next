const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

async function main() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        console.error("❌ Missing environment variables. Please check .env.local");
        process.exit(1);
    }

    const db = createClient({ url, authToken });

    console.log("🛠 Setting up Users table...");

    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                image TEXT,
                settings TEXT, 
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Check if admin exists
        const rs = await db.execute({
            sql: "SELECT * FROM users WHERE email = ?",
            args: ["admin@example.com"]
        });

        if (rs.rows.length === 0) {
            console.log("Creating default admin user...");
            const hashedPassword = await bcrypt.hash("admin123", 10);

            await db.execute({
                sql: "INSERT INTO users (name, email, password, settings) VALUES (?, ?, ?, ?)",
                args: ["Admin", "admin@example.com", hashedPassword, "{}"]
            });
            console.log("✅ Admin user created.\nEmail: admin@example.com\nPassword: admin123");
        } else {
            console.log("ℹ️ Admin user already exists.");
        }
    } catch (e) {
        console.error("Error setting up users:", e);
    }
}

main().catch(console.error);
