require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');

const User = require('./models/user');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

//views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//security & performance
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());

//static
app.use(express.static(path.join(__dirname, 'public')));

//parsers & logging
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan(isProd ? 'combined' : 'dev'));

//DB
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

//session
if (isProd) app.set('trust proxy', 1);

const ONE_HOUR_MS = 60 * 60 * 1000;

app.use(session({
    name: 'sid',
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: ONE_HOUR_MS,
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'lax' : 'lax'
    },
    store: MongoStore.create({
        mongoUrl: dbURI,
        ttl: Math.floor(ONE_HOUR_MS / 1000),
        touchAfter: 15 * 60
    })
}));

app.use(flash());
app.use(async (req, res, next) => {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            req.user = user || null;
            res.locals.user = user || null;
        } catch (err) {
            console.error('Error fetching user:', err);
            req.user = null;
            res.locals.user = null;
        }
    } else {
        req.user = null;
        res.locals.user = null;
    }
    res.locals.successMessages = req.flash('success');
    res.locals.errorMessages = req.flash('error');
    next();
});

//routes
const mainRoutes = require('./routes/mainRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/', mainRoutes);
app.use('/events', eventRoutes);
app.use('/user', userRoutes);

//404 (before error handler)
app.use((req, res) => {
    res.status(404).render('error', {
        errorCode: 404,
        errorTitle: 'Page Not Found',
        errorMessage: 'The page you are looking for does not exist.'
    });
});

//error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).render('error', {
        errorCode: err.status || 500,
        errorTitle: 'Internal Server Error',
        errorMessage: isProd ? 'An unexpected error occurred.' : (err.message || 'An unexpected error occurred.')
    });
});

module.exports = app;


