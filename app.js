require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const { isAuthenticated, isGuest, isHost } = require('./middlewares');
const User = require('./models/user');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

//configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//configure multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    format: async (req, file) => 'png',
    public_id: (req, file) => Date.now().toString() + '-' + file.originalname
  }
});

const upload = multer({ storage: storage });

//create app
const app = express();

//configure app
let port = process.env.PORT || 3000;
let host = process.env.HOST || 'localhost';
app.set('view engine', 'ejs');
//app.set('views', './views');
app.set('views', path.join(__dirname, 'views'));

//serve static files
app.use(express.static(path.join(__dirname, 'public')));

//mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('tiny'));

//MongoDB connection URI
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });

//session middleware
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 60 * 60 * 1000, 
    secure: false, 
    httpOnly: true, 
  },
  store: MongoStore.create({ mongoUrl: dbURI })
}));

app.use(flash());

//middleware to pass user data and flash messages to views
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      req.user = user;
      res.locals.user = user;
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  } else {
    req.user = null;
    res.locals.user = null;
  }
  res.locals.successMessages = req.flash('success');
  res.locals.errorMessages = req.flash('error');
  next();
});

//set up routes
const mainRoutes = require('./routes/mainRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/', mainRoutes);
app.use('/events', eventRoutes);
app.use('/user', userRoutes);

//error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).render('error', { errorCode: 500, errorTitle: 'Internal Server Error', errorMessage: 'An unexpected error occurred.' });
});

//404 handler
app.use((req, res, next) => {
  res.status(404).render('error', { errorCode: 404, errorTitle: 'Page Not Found', errorMessage: 'The page you are looking for does not exist.' });
});

//export the app instead of starting the server
module.exports = app;

