// scripts/prepare-pages.js
// Copy OpenNext worker and its dependencies into .open-next/assets/_worker.js/
// so Cloudflare Pages can use it as a Pages Function (Advanced Mode)

const fs = require('fs');
const path = require('path');

const openNextDir = '.open-next';
const workerDir = path.join(openNextDir, 'assets', '_worker.js');

// Create _worker.js directory
fs.mkdirSync(workerDir, { recursive: true });

// Copy all files and directories except 'assets' folder
const entries = fs.readdirSync(openNextDir);
for (const entry of entries) {
    if (entry === 'assets') continue;

    const src = path.join(openNextDir, entry);
    // Rename worker.js to index.js (Cloudflare Pages _worker.js directory convention)
    const destName = entry === 'worker.js' ? 'index.js' : entry;
    const dest = path.join(workerDir, destName);

    fs.cpSync(src, dest, { recursive: true });
    console.log(`Copied: ${src} -> ${dest}`);
}

console.log('Pages worker directory prepared successfully!');
