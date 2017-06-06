const express = require('express');
const db = require('../models/database.js');
const router = express.Router();
const pollIdHandler = require('./polls-id.js');
const pollsDb = require('../models/polls.js');

//handle base route to /polls : retrieves all polls
router.get('/', (req, res, next) => {
    let user = global.debug.on ? global.debug.getUser() : req.user;
    pollsDb.getAll((err, polls)=>{
        if(err){
            console.log(err);
        } else {
            debug.log(polls);
            res.render('polls', {user: user && user.name, polls: polls});
        }
    });    
});

//handle /polls/:id
router.get('/:id', pollIdHandler);

module.exports = router;