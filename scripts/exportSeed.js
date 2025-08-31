// scripts/exportSeed.js (overwrites defaultEvents.json)
// Usage:
//   node scripts/exportSeed.js
//   node scripts/exportSeed.js --seed-only
//   node scripts/exportSeed.js --out seed/defaultEvents.json --force

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
        if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');

        await mongoose.connect(process.env.MONGODB_URI);

        const Event = require('../models/eventModel');
        const User  = require('../models/user');

        const query = seedOnly ? { isSeed: true } : {};
        const docs = await Event.find(
            query,
            'title category location details startDateTime endDateTime image host'
        )
            .sort({ startDateTime: 1 })
            .populate('host', 'email firstName lastName')
            .lean();

        const data = docs.map(e => ({
            title: e.title,
            category: e.category,
            location: e.location,
            details: e.details,
            startDateTime: e.startDateTime ? new Date(e.startDateTime).toISOString() : null,
            endDateTime: e.endDateTime ? new Date(e.endDateTime).toISOString() : null,
            image: e.image || null,
            // portable host fields (no ObjectId coupling)
            hostEmail: e.host && e.host.email ? e.host.email : null,
            hostName: e.host ? `${e.host.firstName || ''} ${e.host.lastName || ''}`.trim() : null
        }));

        const outPath = path.isAbsolute(outFile) ? outFile : path.join(process.cwd(), outFile);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });

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


