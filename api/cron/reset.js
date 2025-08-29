///api/cron/reset.js
//Daily reset for events on Vercel.
//Modes:
//RESET_MODE=refresh  → only refresh seeded defaults (keeps user events)
//RESET_MODE=full     → wipe all events/RSVPs and reinsert defaults

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

let conn = null;
async function connect() {
    if (conn) return conn;
    conn = await mongoose.connect(process.env.MONGODB_URI);
    return conn;
}

function getModels() {
    const Event = require('../../models/eventModel');
    const RSVP  = require('../../models/rsvp');
    const User  = require('../../models/user');
    return { Event, RSVP, User };
}

function loadDefaults() {
    const p = path.join(process.cwd(), 'seed', 'defaultEvents.json');
    if (!fs.existsSync(p)) {
        const msg = `Seed file not found at ${p}`;
        throw new Error(msg);
    }
    const raw = fs.readFileSync(p, 'utf-8');
    return JSON.parse(raw);
}

async function fullResetToDefaults({ hostUserId }, { Event, RSVP, User }) {
    await RSVP.deleteMany({});
    await Event.deleteMany({});
    await User.updateMany({}, { $set: { events: [], rsvps: [] } });

    const defaults = loadDefaults().map(e => ({
        ...e,
        isSeed: true,
        host: hostUserId
    }));

    if (defaults.length) await Event.insertMany(defaults);
    return { mode: 'full', inserted: defaults.length };
}

async function refreshSeededDefaults({ hostUserId }, { Event, RSVP, User }) {
    const seededIds = await Event.find({ isSeed: true }).distinct('_id');

    if (seededIds.length) {
        await RSVP.deleteMany({ event: { $in: seededIds } });
        await Event.deleteMany({ _id: { $in: seededIds } });
        await User.updateMany({}, { $pull: { events: { $in: seededIds } } });
    }

    const defaults = loadDefaults().map(e => ({
        ...e,
        isSeed: true,
        host: hostUserId
    }));

    if (defaults.length) await Event.insertMany(defaults);
    return { mode: 'refresh', removed: seededIds.length, inserted: defaults.length };
}

module.exports = async (req, res) => {
    try {
        const provided = req.query.secret || req.headers['x-cron-secret'];
        const fromVercelCron = typeof req.headers['x-vercel-cron'] !== 'undefined';
        if (!fromVercelCron) {
            if (!provided || provided !== process.env.CRON_SECRET) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
        }

        await connect();
        const models = getModels();

        const mode = (process.env.RESET_MODE || 'refresh').toLowerCase();
        const hostUserId = process.env.HOST_USER_ID || '';

        if (!hostUserId) {
            throw new Error('HOST_USER_ID not set. Add it in Vercel → Settings → Environment Variables.');
        }

        const result =
            mode === 'full'
                ? await fullResetToDefaults({ hostUserId }, models)
                : await refreshSeededDefaults({ hostUserId }, models);

        return res.status(200).json({ ok: true, at: new Date().toISOString(), ...result });
    } catch (err) {
        console.error('[cron/reset] failed:', err);
        return res.status(500).json({ ok: false, error: err.message });
    }
};
