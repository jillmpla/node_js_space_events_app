//scripts/exportSeed.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Event = require('../models/eventModel');

        const docs = await Event.find(
            {},
            'title category location details startDateTime endDateTime image'
        ).lean();

        const data = docs.map(e => ({
            title: e.title,
            category: e.category,
            location: e.location,
            details: e.details,
            startDateTime: new Date(e.startDateTime).toISOString(),
            endDateTime: new Date(e.endDateTime).toISOString(),
            image: e.image
        }));

        const outDir = path.join(__dirname, '..', 'seed');
        fs.mkdirSync(outDir, { recursive: true });
        const outFile = path.join(outDir, 'defaultEvents.json');
        fs.writeFileSync(outFile, JSON.stringify(data, null, 2), 'utf-8');

        console.log(`Exported ${data.length} events → ${outFile}`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
})();
