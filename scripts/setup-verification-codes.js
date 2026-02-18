const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env.local" });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
    try {
        console.log("Creating verification_codes table...");
        await db.execute(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER DEFAULT (unixepoch())
      );
    `);
        console.log("verification_codes table created successfully!");
    } catch (err) {
        console.error("Error creating table:", err);
    }
}

main();
