const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const he = require('he');

//get the sign-up form
exports.getSignUp = (req, res) => {
  res.render('signup', { errorMessages: [] });
};

//create a new user
exports.postSignUp = [
  body('firstName').trim().escape().not().isEmpty().withMessage('First name is required'),
  body('lastName').trim().escape().not().isEmpty().withMessage('Last name is required'),
  body('email').trim().normalizeEmail().isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 8, max: 64 }).withMessage('Password must be between 8 and 64 characters long'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('signup', { errorMessages: errors.array().map(err => err.msg) });
    }

    try {
      const { firstName, lastName, email, password } = req.body;
      let existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).render('signup', { errorMessages: ['Email is already in use'] });
      }

      //hash the password with bcryptjs
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({ firstName, lastName, email, password: hashedPassword });
      await user.save();
      req.flash('success', 'Registration successful! Please log in.');
      res.redirect('/user/login');
    } catch (err) {
      next(err);
    }
  }
];

//get login form
exports.getLogin = (req, res) => {
  res.render('login');
};

//process login request
exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('back');
    }

    //compare password with bcryptjs
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('back');
    }

    req.session.regenerate(err => {
      if (err) {
        console.error('Error regenerating session:', err);
        return res.redirect('back');
      }

      req.session.userId = user._id;
      req.session.save((err) => {
        if (err) {
          console.error('Error saving session:', err);
          return res.redirect('back');
        }
        console.log('User ID set in session:', req.session.userId);
        res.redirect('/user/profile');
      });
    });
  } catch (err) {
    next(err);
  }
};

//get profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId)
      .populate('events')
      .populate({
        path: 'rsvps',
        populate: {
          path: 'event'
        }
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

//logout
exports.logout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return next(err);
    }
    res.clearCookie('connect.sid'); //clears the session properly
    console.log('Session destroyed successfully');
    res.redirect('/');
  });
};


