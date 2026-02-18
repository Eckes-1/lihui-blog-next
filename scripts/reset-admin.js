
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
    try {
        const email = '2490918758@qq.com';
        const password = '123abc456aac';
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Cleaning up existing users...');
        await client.execute('DELETE FROM users');

        console.log(`Creating unique admin user: ${email}`);
        await client.execute({
            sql: 'INSERT INTO users (name, email, password, image, created_at) VALUES (?, ?, ?, ?, ?)',
            args: ['Admin', email, hashedPassword, '', Date.now()]
        });

        console.log('Admin user reset successfully.');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (err) {
        console.error('Error resetting admin user:', err);
    }
}

main();
