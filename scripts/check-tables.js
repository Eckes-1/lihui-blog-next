
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
    try {
        const rs = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
        console.log("Database Tables:");
        rs.rows.forEach(r => console.log(`- ${r.name}`));
    } catch (err) {
        console.error(err);
    }
}

main();
