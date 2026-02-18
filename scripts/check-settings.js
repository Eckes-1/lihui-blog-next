
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
    try {
        console.log("=== Schema ===");
        const schema = await client.execute("PRAGMA table_info(settings)");
        console.table(schema.rows);

        console.log("\n=== Content ===");
        const content = await client.execute("SELECT * FROM settings");
        console.log(content.rows);
    } catch (err) {
        console.error(err);
    }
}

main();
