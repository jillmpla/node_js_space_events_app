//controllers/mainController.js
exports.home = (req, res) => {      //render homepage
    res.render('index');
};

exports.contact = (req, res) => {   //render contact page
    res.render('contact');
};

exports.about = (req, res) => {     //render about page
    res.render('about');
};