//routes/mainRoutes.js
const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

router.get('/', mainController.home);             //get homepage
router.get('/contact', mainController.contact);   //get contact page
router.get('/about', mainController.about);       //get about page

module.exports = router;
