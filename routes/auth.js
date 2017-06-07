const express           = require('express');
const db                = require('../models/database.js');
const router            = express.Router();
const usersDb           = require('../models/users.js');

//handle base route to /polls : retrieves all polls
router.get('/', ensureAuthenticated, (req, res, next) => {
    let user = global.debug.getUser(); 
    if(user === undefined){
        user = req.user;
    }
    res.render('profile', {user: user});    
});

function ensureAuthenticated(req, res, next) {
          if (debug.autolog || req.isAuthenticated()) {
              return next();
          }
          res.redirect('/');
};


module.exports = router;