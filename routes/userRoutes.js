//routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isGuest, isAuthenticated } = require('../middlewares');
const rateLimit = require('express-rate-limit');

//rate limiter (login/signup brute-force protection)
const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 minutes
    max: 10, //10 attempts per IP per window
    message: 'Too many login/signup attempts. Please try again in 10 minutes.',
    standardHeaders: true,
    legacyHeaders: false
});

//Sign up
router.get('/signup', isGuest, userController.getSignUp);
router.post('/signup', authLimiter, isGuest, userController.postSignUp);

//Login
router.get('/login', isGuest, userController.getLogin);
router.post('/login', authLimiter, isGuest, userController.postLogin);

//Profile
router.get('/profile', isAuthenticated, userController.getProfile);

//Logout (POST instead of GET)
router.post('/logout', isAuthenticated, userController.logout);

module.exports = router;

