//controllers/eventController.js
const { body, validationResult } = require('express-validator');
const Event = require('../models/eventModel');
const User = require('../models/user');
const RSVP = require('../models/rsvp');
const multer = require('multer');
const { DateTime } = require('luxon');
const mongoose = require('mongoose');
const he = require('he');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// -----------------------------------------------------------------------------
// Cloudinary / Multer config
// -----------------------------------------------------------------------------
const DEFAULT_EVENT_IMAGE =
    'https://res.cloudinary.com/dplfrc9ol/image/upload/v1654531780/no_image.png';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads',
        // store as PNG by default; Cloudinary will handle conversion
        format: async (req, file) => 'png',
        public_id: (req, file) => Date.now().toString() + '-' + file.originalname
    }
});

// Add basic file size/type protections
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    fileFilter: (req, file, cb) => {
        // allow if no file uploaded
        if (!file) return cb(null, true);
        const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        cb(new Error('Only image uploads are allowed (png/jpeg/webp/gif).'));
    }
});

// -----------------------------------------------------------------------------
// helper functions
// -----------------------------------------------------------------------------
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

const isEndDateAfterStartDate = (endDate, { req }) => {
    const startDate = new Date(req.body.startDate);
    const endDateObj = new Date(endDate);
    return endDateObj > startDate;
};

const isAfterToday = (date) => {
    const today = new Date();
    const dateObj = new Date(date);
    return dateObj > today;
};

function formatEventDates(event) {
    event.startDateTimeFormatted = DateTime.fromJSDate(event.startDateTime).toLocaleString(DateTime.DATETIME_MED);
    event.endDateTimeFormatted = DateTime.fromJSDate(event.endDateTime).toLocaleString(DateTime.DATETIME_MED);
    event.startDateTimeISO = DateTime.fromJSDate(event.startDateTime).toISO({ suppressSeconds: true, suppressMilliseconds: true });
    event.endDateTimeISO = DateTime.fromJSDate(event.endDateTime).toISO({ suppressSeconds: true, suppressMilliseconds: true });
}

// -----------------------------------------------------------------------------
// get and show all events, grouped by category -> Read
// -----------------------------------------------------------------------------
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().lean().populate('host', 'firstName lastName');
        events.forEach(formatEventDates);
        const categories = [...new Set(events.map((event) => event.category))];
        res.render('events', { events, categories, he });
    } catch (err) {
        console.error('getAllEvents error:', err);
        res.status(500).render('error', { error: 'Database error' });
    }
};

// -----------------------------------------------------------------------------
// get and show details of a specific event by its ID -> Read
// -----------------------------------------------------------------------------
exports.getEventById = async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).render('error', { error: 'Invalid event ID' });
    }
    try {
        const event = await Event.findById(req.params.id).lean().populate('host', 'firstName lastName');
        if (event) {
            formatEventDates(event);
            const yesRSVPCount = await RSVP.countDocuments({ event: req.params.id, status: 'YES' });
            res.render('event', { event, user: req.user, yesRSVPCount, he });
        } else {
            res.status(404).render('error', { error: 'Event not found' });
        }
    } catch (err) {
        console.error('getEventById error:', err);
        res.status(500).render('error', { error: 'Database error' });
    }
};

// -----------------------------------------------------------------------------
// form to create a new event
// -----------------------------------------------------------------------------
exports.newEventForm = (req, res) => {
    res.render('newEvent', { formData: {}, he });
};

// -----------------------------------------------------------------------------
// form to edit an existing event by its ID
// -----------------------------------------------------------------------------
exports.editEventForm = async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res
            .status(400)
            .render('error', { errorCode: 400, errorTitle: 'Invalid Event ID', errorMessage: 'The event ID provided is invalid.' });
    }
    try {
        const event = await Event.findById(req.params.id).lean();
        if (event) {
            if (event.host.toString() !== req.session.userId) {
                return res
                    .status(401)
                    .render('error', { errorCode: 401, errorTitle: 'Unauthorized', errorMessage: 'You are not authorized to access this event.' });
            }
            formatEventDates(event);
            res.render('edit', { event, he, errors: [] });
        } else {
            res
                .status(404)
                .render('error', { errorCode: 404, errorTitle: 'Event Not Found', errorMessage: 'The event you are looking for does not exist.' });
        }
    } catch (err) {
        console.error('editEventForm error:', err);
        res
            .status(500)
            .render('error', { errorCode: 500, errorTitle: 'Database Error', errorMessage: 'A database error occurred.' });
    }
};

// -----------------------------------------------------------------------------
// create a new event -> Create
// NOTE: we intentionally do NOT .escape() here to avoid double-encoding;
// rely on EJS <%= ... %> to escape on render.
// -----------------------------------------------------------------------------
exports.createEvent = [
    upload.single('eventImage'),
    body('eventTitle').trim().notEmpty().withMessage('Event title is required'),
    body('eventCategory')
        .trim()
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['Astronomy', 'Science', 'Space', 'Education', 'Other'])
        .withMessage('Invalid category'),
    body('startDate')
        .trim()
        .notEmpty()
        .withMessage('Start date is required')
        .isISO8601()
        .withMessage('Invalid start date format')
        .custom(isAfterToday)
        .withMessage('Start date must be after today'),
    body('endDate')
        .trim()
        .notEmpty()
        .withMessage('End date is required')
        .isISO8601()
        .withMessage('Invalid end date format')
        .custom(isEndDateAfterStartDate)
        .withMessage('End date must be after the start date'),
    body('eventLocation').trim().notEmpty().withMessage('Location is required'),
    body('eventDescription').trim().notEmpty().withMessage('Description is required'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Re-render the form with validation errors and previously entered data
            return res.status(400).render('newEvent', { errors: errors.array(), formData: req.body, he });
        }

        try {
            const { eventTitle, eventCategory, startDate, endDate, eventLocation, eventDescription, noImage } = req.body;

            // Either a file was uploaded or the "No Image" checkbox was selected
            const eventImage =
                noImage === 'on'
                    ? DEFAULT_EVENT_IMAGE
                    : (req.file ? req.file.path : null);

            if (!eventImage) {
                return res.status(400).render('newEvent', {
                    error: 'Please either upload an image or select "No Image".',
                    formData: req.body,
                    he
                });
            }

            const newEvent = new Event({
                title: eventTitle,
                category: eventCategory,
                startDateTime: new Date(startDate),
                endDateTime: new Date(endDate),
                location: eventLocation,
                details: eventDescription,
                image: eventImage,
                host: req.session.userId
            });

            const event = await newEvent.save();

            // Keep user.events in sync (optional denormalization)
            const user = await User.findById(req.session.userId);
            if (user) {
                user.events.push(event._id);
                await user.save();
            }

            res.redirect('/events');
        } catch (err) {
            console.error('Error creating event:', err);
            const friendly =
                err.name === 'ValidationError'
                    ? 'Validation error'
                    : (err.message || 'Database error');
            res.status(400).render('newEvent', { error: friendly, formData: req.body, he });
        }
    }
];

// -----------------------------------------------------------------------------
// update an existing event via ID -> Update
// NOTE: same sanitization approach as createEvent; do not double-encode.
// -----------------------------------------------------------------------------
exports.updateEvent = [
    upload.single('eventImage'),
    body('eventTitle').trim().notEmpty().withMessage('Event title is required'),
    body('eventCategory')
        .trim()
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['Astronomy', 'Science', 'Space', 'Education', 'Other'])
        .withMessage('Invalid category'),
    body('startDate')
        .trim()
        .notEmpty()
        .withMessage('Start date is required')
        .isISO8601()
        .withMessage('Invalid start date format')
        .custom(isAfterToday)
        .withMessage('Start date must be after today'),
    body('endDate')
        .trim()
        .notEmpty()
        .withMessage('End date is required')
        .isISO8601()
        .withMessage('Invalid end date format')
        .custom(isEndDateAfterStartDate)
        .withMessage('End date must be after the start date'),
    body('eventLocation').trim().notEmpty().withMessage('Location is required'),
    body('eventDescription').trim().notEmpty().withMessage('Description is required'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // When re-rendering edit, pass back the posted body so fields remain filled
            return res.status(400).render('edit', { errors: errors.array(), event: req.body, he });
        }

        if (!isValidObjectId(req.params.id)) {
            return res
                .status(400)
                .render('error', { errorCode: 400, errorTitle: 'Invalid Event ID', errorMessage: 'The event ID provided is invalid.' });
        }

        try {
            const event = await Event.findById(req.params.id);
            if (!event) {
                return res
                    .status(404)
                    .render('error', { errorCode: 404, errorTitle: 'Event Not Found', errorMessage: 'The event you are looking for does not exist.' });
            }
            if (event.host.toString() !== req.session.userId) {
                return res
                    .status(401)
                    .render('error', { errorCode: 401, errorTitle: 'Unauthorized', errorMessage: 'You are not authorized to access this event.' });
            }

            const { eventTitle, eventCategory, startDate, endDate, eventLocation, eventDescription, noImage } = req.body;
            const eventImage = req.file ? req.file.path : undefined;

            // Assign raw values; EJS will escape on render via <%= ... %>.
            event.title = eventTitle;
            event.category = eventCategory;
            event.startDateTime = new Date(startDate);
            event.endDateTime = new Date(endDate);
            event.location = eventLocation;
            event.details = eventDescription;

            // If "No Image" is checked, force default placeholder; else use uploaded or keep previous
            event.image = noImage === 'on' ? DEFAULT_EVENT_IMAGE : (eventImage || event.image);

            await event.save();
            res.redirect('/events');
        } catch (err) {
            console.error('updateEvent error:', err);
            res
                .status(500)
                .render('error', { errorCode: 500, errorTitle: 'Database Error', errorMessage: 'A database error occurred.' });
        }
    }
];

// -----------------------------------------------------------------------------
// delete an existing event -> Delete
// -----------------------------------------------------------------------------
exports.deleteEvent = async (req, res) => {
    const eventId = req.params.id;

    if (!isValidObjectId(eventId)) {
        return res.status(400).json({ error: 'Invalid event ID' });
    }

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (event.host.toString() !== req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await RSVP.deleteMany({ event: eventId });
        await event.deleteOne();
        res.json({ message: 'Event Deleted Successfully!' });
    } catch (err) {
        console.error('deleteEvent error:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

// -----------------------------------------------------------------------------
// handles RSVP requests
// -----------------------------------------------------------------------------
exports.handleRSVP = [
    body('status').isIn(['YES', 'NO', 'MAYBE']).withMessage('Invalid RSVP status'),

    async (req, res, next) => {
        const eventId = req.params.id;
        const userId = req.session.userId;
        const { status } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res
                .status(400)
                .render('error', { errorCode: 400, errorTitle: 'Bad Request', errorMessage: errors.array()[0].msg });
        }

        try {
            const event = await Event.findById(eventId).populate('host');
            if (!event) {
                return res
                    .status(404)
                    .render('error', { errorCode: 404, errorTitle: 'Event Not Found', errorMessage: 'The event you are looking for does not exist.' });
            }

            if (event.host && event.host._id.toString() === userId) {
                return res
                    .status(401)
                    .render('error', { errorCode: 401, errorTitle: 'Unauthorized', errorMessage: 'You cannot RSVP to your own event.' });
            }

            // Upsert RSVP for (userId, eventId)
            const rsvp = await RSVP.findOneAndUpdate(
                { user: userId, event: eventId },
                { status },
                { upsert: true, new: true, runValidators: true }
            );

            // Maintain user.rsvps (optional denormalization)
            const user = await User.findById(userId);
            if (user && !user.rsvps.map(String).includes(String(rsvp._id))) {
                user.rsvps.push(rsvp._id);
                await user.save();
            }

            // Compute YES count (used by event view)
            const yesRSVPCount = await RSVP.countDocuments({ event: eventId, status: 'YES' });

            res.redirect(`/events/${eventId}`);
        } catch (err) {
            console.error('Error handling RSVP:', err);
            res
                .status(500)
                .render('error', { errorCode: 500, errorTitle: 'Database Error', errorMessage: 'A database error occurred.' });
        }
    }
];

