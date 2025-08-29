// /api/cron/reset.js
// Vercel Serverless Function to reset events daily.
// Modes:
//   - RESET_MODE=refresh  → only refresh seeded defaults (keeps user events)
//   - RESET_MODE=full     → wipe all events/RSVPs and reinsert defaults
//
// Security: require header "x-cron-secret: <CRON_SECRET>"

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

let conn = null;
async function connect() {
    if (conn) return conn;
    conn = await mongoose.connect(process.env.MONGODB_URI, {
    });
    return conn;
}

function getModels() {
    const Event = require('../../models/eventModel');
    const RSVP = require('../../models/rsvp');
    const User = require('../../models/user');
    return { Event, RSVP, User };
}

function loadDefaults() {
    const p = path.join(process.cwd(), 'seed', 'defaultEvents.json');
    const raw = fs.readFileSync(p, 'utf-8');
    return JSON.parse(raw);
}

async function fullResetToDefaults({ hostUserId = null }, models) {
    const { Event, RSVP, User } = models;

    await RSVP.deleteMany({});
    await Event.deleteMany({});
    await User.updateMany({}, { $set: { events: [], rsvps: [] } });

    const defaults = loadDefaults().map(e => ({
        ...e,
        isSeed: true,
        host: hostUserId || undefined
    }));

    if (defaults.length) {
        await Event.insertMany(defaults);
    }

    return { inserted: defaults.length, mode: 'full' };
}

async function refreshSeededDefaults({ hostUserId = null }, models) {
    const { Event, RSVP, User } = models;

    const seededIds = await Event.find({ isSeed: true }).distinct('_id');

    if (seededIds.length) {
        await RSVP.deleteMany({ event: { $in: seededIds } });
        await Event.deleteMany({ _id: { $in: seededIds } });
        await User.updateMany({}, { $pull: { events: { $in: seededIds } } });
    }

    const defaults = loadDefaults().map(e => ({
        ...e,
        isSeed: true,
        host: hostUserId || undefined
    }));

    if (defaults.length) {
        await Event.insertMany(defaults);
    }

    return { removed: seededIds.length, inserted: defaults.length, mode: 'refresh' };
}

module.exports = async (req, res) => {
    try {
        const provided = req.headers['x-cron-secret'] || req.query.secret;
        if (!provided || provided !== process.env.CRON_SECRET) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await connect();
        const models = getModels();

        const mode = (process.env.RESET_MODE || 'refresh').toLowerCase();
        const hostUserId = process.env.HOST_USER_ID || null;

        const result =
            mode === 'full'
                ? await fullResetToDefaults({ hostUserId }, models)
                : await refreshSeededDefaults({ hostUserId }, models);

        return res.status(200).json({ ok: true, ...result, at: new Date().toISOString() });
    } catch (err) {
        console.error('[reset] failed', err);
        return res.status(500).json({ ok: false, error: err.message });
    } finally {
    }
};
