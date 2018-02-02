const express = require("express");
const router = express.Router();
const Poll = require("../models/polls");
const middleWare = require("../middleware");
const isLoggedIn = middleWare.isLoggedIn;
const checkPollOwnership = middleWare.checkPollOwnership;
require("../helpers/debug");
//INDEX ROUTE - shows listing of all polls
router.get("/", function(req, res){
    // res.send("showing polls");
    Poll.find({}, function(err, polls){
        if(err){
            console.log("ERROR");
            res.send(err);
        } else {
            res.render("polls/index", {polls})
        }
    });    
});


//INDEX ROUTE 2 - shows listing of user polls
router.get("/user", isLoggedIn, function(req, res){
    //for now, it does the same thing as first index route
    Poll.find({}, function(err, polls){
        if(err){
            debug.log("ERROR");
            res.send(err);
        } else {
            res.render("polls/index", {polls})
        }
    });    
});

//NEW ROUTE
router.get("/new", isLoggedIn, function(req, res){
    res.render("polls/new");
});

//CREATE ROUTE
router.post("/", isLoggedIn, function(req, res){
    debug.log("Creating new poll:");
    debug.log(req.body.poll);
    let poll = req.body.poll;
    let debugUser = debug.getUser();
    poll.author = {};
    poll.author.id = debugUser ? debug.getUser()._id : undefined || req.user._id;
    poll.author.name = debugUser ? debug.getUser().username : undefined || req.user.username;
    //get poll.optionsRaw and reformat is as [{option: option}]    
    poll.pollOptions = poll.optionsRaw.split("|").slice(1).map((option) =>{
        return {option, voters:[]};
    });
    poll.optionsRaw = "";
    debug.log("My poll: ");
    debug.log(poll);
    // res.send("created poll!");
    Poll.create(poll, function(err, poll){
        if(err){
            debug.log("Could not create!");
            debug.log(err);
            res.send(err); //add proper error handling
        } else {

            res.redirect("/polls");
            // res.sendStatus(200); 
        }
    });    
});


//SHOW ROUTE - shows more info about poll
router.get("/:id", function(req, res){
    Poll.findById(req.params.id, function(err, poll){
        if(err || !poll){
            debug.log(err);
            return res.redirect("/polls");
        } else {
            res.render("polls/show", {poll});
        }
    });
});

//UDPATE POLL ROUTE - VOTE
router.put("/:id/vote", isLoggedIn, function (req, res){    
    var optionId = req.body.option;
    debug.log(optionId);
    if(optionId === "new"){
        Poll.findOneAndUpdate(
            {_id: req.params.id},
            {$addToSet: {pollOptions: {option: req.body.newOption, count: 1, votes:["Carl"]}}},
            {new: true},
            function(err, poll){
                if(err){
                    debug.log(err);  
                    res.redirect("/polls");
                } else {
                    //redirect somehwere (show page)
                    res.redirect("back");
                }
        });
    } else {
        //enable or disable multivote for debug
        var query = {_id: req.params.id, "pollOptions._id": optionId, "pollOptions.voters": {$not: {$all: ["Carl"]}}}; 
        if(debug.canMultivote()){
            query = {_id: req.params.id, "pollOptions._id": optionId};
        }
        //record already exists, so update it with new vote and voter
        Poll.findOneAndUpdate(
            query,
            {$addToSet: {"pollOptions.$.voters" : "Carl"}, $inc: { "pollOptions.$.count" : 1 }},
            {new: true},
            function(err, poll){
                if(err){
                    debug.log(err);  
                    res.redirect("/polls");
                } else {
                    if(poll){
                        //redirect somehwere (show page)
                        res.redirect("back");
                    } else {
                        res.send("You cannot vote more than once!");
                    }
                    
                }
        });
        // Poll.findOneAndUpdate(
        //     {_id: req.params.id, "pollOptions._id": optionId},
        //     {$inc: { "pollOptions.$.count" : 1 } },
        //     {new: true},
        //     function(err, poll){
        //         if(err){
        //             debug.log(err);  
        //             res.redirect("/polls");
        //         } else {
        //             //redirect somehwere (show page)
        //             res.redirect("back");
        //         }
        // });
    }
    
});


//DESTROY POLL ROUTE
// note: add in middleware to check if user is logged in and has voted already
router.delete("/:id", function (req, res){
    //find and update the correct campground
    Poll.findByIdAndRemove(req.params.id, function(err){
      if(err){
        debug.log(err);  
        res.redirect("/polls");
      } else {
        //redirect somehwere (show page)
        res.redirect("/polls");
      }
    });
});

module.exports = router;