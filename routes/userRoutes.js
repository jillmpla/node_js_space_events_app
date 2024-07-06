const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isGuest, isAuthenticated } = require('../middlewares');
const rateLimit = require('express-rate-limit');

//rate limiter
const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 minutes
    max: 10, //limit each IP to 10 requests
    message: 'Too many login attempts from this IP, please try again after 10 minutes',
    standardHeaders: true, 
    legacyHeaders: false, 
  });

//rate limiter applied to login and signup routes
router.get('/signup', isGuest, userController.getSignUp);
router.post('/signup', isGuest, authLimiter, userController.postSignUp);
router.get('/login', isGuest, userController.getLogin);
router.post('/login', isGuest, authLimiter, userController.postLogin);
router.get('/profile', isAuthenticated, userController.getProfile);
router.get('/logout', isAuthenticated, userController.logout);

module.exports = router;
