const mongoose = require('mongoose');
const Event = require('./models/eventModel');

const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  req.flash('error', 'Please log in to continue');
  return res.redirect('/user/login');
};

const isGuest = (req, res, next) => {
  if (!req.session.userId) {
    return next();
  }
  req.flash('error', 'You are already logged in');
  return res.redirect('/user/profile');
};

const isHost = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).render('error', { errorCode: 400, errorTitle: 'Invalid Event ID', errorMessage: 'The event ID provided is invalid.' });
  }

  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) {
      return res.status(404).render('error', { errorCode: 404, errorTitle: 'Event Not Found', errorMessage: 'The event you are looking for does not exist.' });
    }
    if (event.host.toString() !== req.session.userId) {
      return res.status(401).render('error', { errorCode: 401, errorTitle: 'Unauthorized', errorMessage: 'You are not authorized to access this event.' });
    }
    next();
  } catch (err) {
    console.error('Error in isHost middleware:', err);
    return res.status(500).render('error', { errorCode: 500, errorTitle: 'Internal Server Error', errorMessage: 'An internal server error occurred. Please try again later.' });
  }
};

const isNotHost = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).render('error', { errorCode: 400, errorTitle: 'Invalid Event ID', errorMessage: 'The event ID provided is invalid.' });
  }

  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) {
      return res.status(404).render('error', { errorCode: 404, errorTitle: 'Event Not Found', errorMessage: 'The event you are looking for does not exist.' });
    }
    if (event.host.toString() === req.session.userId) {
      return res.status(401).render('error', { errorCode: 401, errorTitle: 'Unauthorized', errorMessage: 'You cannot RSVP to your own event.' });
    }
    next();
  } catch (err) {
    console.error('Error in isNotHost middleware:', err);
    return res.status(500).render('error', { errorCode: 500, errorTitle: 'Internal Server Error', errorMessage: 'An internal server error occurred. Please try again later.' });
  }
};

module.exports = { isAuthenticated, isGuest, isHost, isNotHost };


