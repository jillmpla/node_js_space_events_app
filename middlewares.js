const mongoose = require('mongoose');
const Event = require('./models/eventModel');

/**
 * isAuthenticated
 * Gate: only allow logged-in users through.
 * If not logged in, set a flash message and bounce to /user/login.
 */
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    req.flash('error', 'Please log in to continue');
    return res.redirect('/user/login');
};

/**
 * isGuest
 * Gate: only allow visitors (not logged in) through.
 */
const isGuest = (req, res, next) => {
    if (!req.session.userId) {
        return next();
    }
    req.flash('error', 'You are already logged in');
    return res.redirect('/user/profile');
};

/**
 * isHost
 * Gate: only the event's host can proceed.
 * Steps:
 * 1) Validate :id is a valid Mongo ObjectId → 400 if not.
 * 2) Load the event → 404 if missing.
 * 3) Compare event.host to current session user → 401 if mismatch.
 */
const isHost = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res
            .status(400)
            .render('error', {
                errorCode: 400,
                errorTitle: 'Invalid Event ID',
                errorMessage: 'The event ID provided is invalid.'
            });
    }

    try {
        const event = await Event.findById(req.params.id).lean();

        if (!event) {
            return res
                .status(404)
                .render('error', {
                    errorCode: 404,
                    errorTitle: 'Event Not Found',
                    errorMessage: 'The event you are looking for does not exist.'
                });
        }

        if (event.host.toString() !== req.session.userId) {
            return res
                .status(401)
                .render('error', {
                    errorCode: 401,
                    errorTitle: 'Unauthorized',
                    errorMessage: 'You are not authorized to access this event.'
                });
        }

        return next();
    } catch (err) {
        console.error('Error in isHost middleware:', err);
        return res
            .status(500)
            .render('error', {
                errorCode: 500,
                errorTitle: 'Internal Server Error',
                errorMessage: 'An internal server error occurred. Please try again later.'
            });
    }
};

/**
 * isNotHost
 * Gate: the event's host is *not* allowed (to RSVP to their own event).
 */
const isNotHost = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res
            .status(400)
            .render('error', {
                errorCode: 400,
                errorTitle: 'Invalid Event ID',
                errorMessage: 'The event ID provided is invalid.'
            });
    }

    try {
        const event = await Event.findById(req.params.id).lean();

        if (!event) {
            return res
                .status(404)
                .render('error', {
                    errorCode: 404,
                    errorTitle: 'Event Not Found',
                    errorMessage: 'The event you are looking for does not exist.'
                });
        }

        if (event.host.toString() === req.session.userId) {
            return res
                .status(401)
                .render('error', {
                    errorCode: 401,
                    errorTitle: 'Unauthorized',
                    errorMessage: 'You cannot RSVP to your own event.'
                });
        }

        return next();
    } catch (err) {
        console.error('Error in isNotHost middleware:', err);
        return res
            .status(500)
            .render('error', {
                errorCode: 500,
                errorTitle: 'Internal Server Error',
                errorMessage: 'An internal server error occurred. Please try again later.'
            });
    }
};

module.exports = { isAuthenticated, isGuest, isHost, isNotHost };



