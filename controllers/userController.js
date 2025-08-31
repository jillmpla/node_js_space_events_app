//controllers/userController.js
const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const he = require('he');

//GET /user/signup
exports.getSignUp = (req, res) => {
    res.render('signup', { errorMessages: [] });
};

//POST /user/signup
exports.postSignUp = [
    body('firstName').trim().escape().not().isEmpty().withMessage('First name is required'),
    body('lastName').trim().escape().not().isEmpty().withMessage('Last name is required'),
    body('email').trim().normalizeEmail().isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 8, max: 64 }).withMessage('Password must be between 8 and 64 characters long'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res
                .status(400)
                .render('signup', { errorMessages: errors.array().map(err => err.msg) });
        }

        try {
            const { firstName, lastName } = req.body;
            const email = (req.body.email || '').toLowerCase().trim();

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).render('signup', { errorMessages: ['Email is already in use'] });
            }

            const user = new User({
                firstName,
                lastName,
                email,
                password: req.body.password
            });

            await user.save();

            req.flash('success', 'Registration successful! Please log in.');
            res.redirect('/user/login');
        } catch (err) {
            next(err);
        }
    }
];

//GET /user/login
exports.getLogin = (req, res) => {
    res.render('login');
};

//POST /user/login
exports.postLogin = async (req, res, next) => {
    try {
        const email = (req.body.email || '').toLowerCase().trim();
        const password = req.body.password;

        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('back');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('back');
        }

        req.session.regenerate(err => {
            if (err) {
                console.error('Error regenerating session:', err);
                req.flash('error', 'Something went wrong. Please try again.');
                return res.redirect('back');
            }

            req.session.userId = user._id;
            req.session.save(err2 => {
                if (err2) {
                    console.error('Error saving session:', err2);
                    req.flash('error', 'Something went wrong. Please try again.');
                    return res.redirect('back');
                }
                res.redirect('/user/profile');
            });
        });
    } catch (err) {
        next(err);
    }
};

//GET /user/profile
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.session.userId)
            .populate('events')
            .populate({
                path: 'rsvps',
                populate: { path: 'event' }
            });

        if (!user) {
            req.flash('error', 'Please log in to view your profile');
            return res.redirect('/user/login');
        }

        res.render('profile', { user, he });
    } catch (err) {
        next(err);
    }
};

//POST /user/logout
exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return next(err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};
