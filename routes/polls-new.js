const express = require('express');
const router = express.Router();
const db = require('../models/database.js');
const pollsDb = require('../models/polls.js');

//handle base route to /polls/new to display new poll form
router.get('/', (req, res, next) => {
    let user = global.debug.on ? global.debug.getUser() : req.user;
    res.render('newpoll', {user: user && user.name});
});

//handle /polls/new post event to create new poll
router.post('/', (req, res, next) => {
    let user = global.debug.on ? global.debug.getUser() : req.user;
    let title = req.body.title;
    let options = req.body.options;
    debug.log('creating a new poll: ');
    debug.log(title);
    //send on successful create
    pollsDb.create(user, title, options);
    res.sendStatus(200);    
});



module.exports = router;