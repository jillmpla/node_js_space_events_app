//routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { isAuthenticated, isHost, isNotHost } = require('../middlewares');

router.get('/', eventController.getAllEvents);
router.get('/new', isAuthenticated, eventController.newEventForm);
router.get('/:id', eventController.getEventById);
router.get('/:id/edit', isAuthenticated, isHost, eventController.editEventForm);
router.post('/', isAuthenticated, eventController.createEvent);
router.post('/:id', isAuthenticated, isHost, eventController.updateEvent);
router.post('/:id/rsvp', isAuthenticated, isNotHost, eventController.handleRSVP);
router.delete('/:id', isAuthenticated, isHost, eventController.deleteEvent);

module.exports = router;



