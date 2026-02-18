
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
    try {
        const rs = await client.execute("SELECT id, name, email FROM users");

        console.log('\n=== Database Users ===');
        if (rs.rows.length === 0) {
            console.log("No users found in database table 'users'.");
        } else {
            rs.rows.forEach(row => {
                console.log(`- Email: ${row.email} (Name: ${row.name || 'N/A'})`);
            });
        }

        console.log('\n=== Environment Users ===');
        if (process.env.ADMIN_PASSWORD) {
            console.log(`- Email: admin@example.com (Fallback Password: ${process.env.ADMIN_PASSWORD})`);
            console.log("  (Note: This fallback only works if 'admin@example.com' is NOT in the database)");
        } else {
            console.log("No ADMIN_PASSWORD configured.");
        }

    } catch (err) {
        console.error("Error querying database:", err);
    }
}

main();
