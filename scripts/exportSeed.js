// scripts/exportSeed.js
// Usage:
//   node scripts/exportSeed.js
//   node scripts/exportSeed.js --seed-only
//   node scripts/exportSeed.js --out seed/defaultEvents.json --force
//
// Notes:
// - Requires MONGODB_URI in your environment (.env locally, platform env in CI).
// - Exports *only* selected Event fields; no user IDs are included.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const args = process.argv.slice(2);
const seedOnly = args.includes('--seed-only');
const outFlagIdx = args.indexOf('--out');
const FORCE = args.includes('--force');
const outFile = outFlagIdx > -1 ? args[outFlagIdx + 1] : path.join('seed', 'defaultEvents.json');

(async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not set. Create a .env or set it in your environment.');
        }

        await mongoose.connect(process.env.MONGODB_URI /*, { readPreference: 'secondaryPreferred' } */);
        const Event = require('../models/eventModel');

        const query = seedOnly ? { isSeed: true } : {};
        const docs = await Event.find(
            query,
            'title category location details startDateTime endDateTime image'
        )
            .sort({ startDateTime: 1 })
            .lean();

        const data = docs.map(e => ({
            title: e.title,
            category: e.category,
            location: e.location,
            details: e.details,
            startDateTime: e.startDateTime ? new Date(e.startDateTime).toISOString() : null,
            endDateTime: e.endDateTime ? new Date(e.endDateTime).toISOString() : null,
            image: e.image || null
        }));

        const outPath = path.isAbsolute(outFile) ? outFile : path.join(process.cwd(), outFile);
        const outDir = path.dirname(outPath);
        fs.mkdirSync(outDir, { recursive: true });

        if (fs.existsSync(outPath) && !FORCE) {
            const stamped = outPath.replace(/\.json$/i, `.${Date.now()}.json`);
            fs.writeFileSync(stamped, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`File existed; wrote snapshot instead → ${stamped}`);
        } else {
            fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`Exported ${data.length} events → ${outPath}`);
        }
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect().catch(() => {});
    }
})();
