const express = require("express");
const router = express.Router();
const Poll = require("../models/polls");
const middleWare = require("../middleware");
const isLoggedIn = middleWare.isLoggedIn;
const checkPollOwnership = middleWare.checkPollOwnership;
//require common messages
const Message = require("../localization")();

//require debug module
require("../helpers/debug");

//INDEX ROUTE - shows listing of all polls
router.get("/", function(req, res){
    //set up options object to send with page render
    var options = {
        filter: req.query.filter || null,
        sort:{}
    };
    options.sort.order = 1;    
    //set up some variables for filtering and sorting the db query
    var sortType = req.query.sort || null;
    var dbSort = {}; 
    var dbQuery = {};
    //set query to "user"; but only if user logged in
    if(req.user && options.filter === "user"){
        dbQuery = {"author.id": req.user._id};
    }
    //change default order if query request descending order
    if(req.query.order == -1){
        options.sort.order = -1;
    }
    //check sort types and construct sortOrder object
    if(!sortType){
        options.sort.key = "name";
        dbSort.name = options.sort.order;
    } else if (sortType === "author") {
        options.sort.key = "author";
        dbSort = {"author.name": options.sort.order};        
    } else if (sortType === "votes") {
        options.sort.key = "votes";
        dbSort.votes = options.sort.order;
    } else {
        //sanity check
        options.sort.key = "name";
        dbSort.name = options.sort.order;
    }    
    //run db query
    Poll.find(dbQuery, null, {sort: dbSort}, function(err, polls){
        if(err){
            debug.log("ERROR GETTING INDEX ROUTE");
            debug.log(err);
            // res.send(err);
        } else {
            // polls : polls contains poll data
            //         options: contains filter, sort.key, and sort.order
            return res.render("polls/index", {polls, options});
        }
    });    
});

//NEW ROUTE
router.get("/new", isLoggedIn, function(req, res){
    return res.render("polls/new");
});

//CREATE ROUTE
router.post("/", isLoggedIn, function(req, res){
    debug.log("Creating new poll:");
    debug.log(req.body.poll);
    let poll = req.body.poll;
    let debugUser = debug.getUser();
    poll.author = {};
    poll.author.id = debugUser ? debug.getUser()._id : undefined || req.user._id;
    poll.author.name = debugUser ? debug.getUser().username : undefined || req.user.fullname;
    //get poll.optionsRaw and reformat is as [{option: option}]    
    poll.pollOptions = poll.optionsRaw.split("|").slice(1).map((option) =>{
        return {option, voters:[]};
    });
    poll.optionsRaw = "";
    // debug.log("My poll: ");
    // debug.log(poll);    
    Poll.create(poll, function(err, poll){
        if(err){            
            debug.log("ERROR CREATING NEW POLL");
            debug.log(err);
            req.flash("error", Message.DidNotCreatePoll);
            return res.redirect("/polls");
        } else {
            req.flash("success", Message.CreatedPoll);
            return res.redirect("/polls");
        }
    });    
});


//SHOW ROUTE - shows more info about poll
router.get("/:id", function(req, res){
    Poll.findById(req.params.id, function(err, poll){
        if(err || !poll){
            debug.log("ERROR GETTING POLL");
            debug.log(err);
            req.flash("error", Message.PollDoesNotExist);
            return res.redirect("/polls");
        } else {
            return res.render("polls/show", {poll});
        }
    });
});

//UDPATE POLL ROUTE - VOTE
// --- note: instead of storing user name in voters we should use the userId/also update models/polls to require this as well
router.put("/:id/vote", function (req, res){    
    var optionId = req.body.option;
    var user = req.user;
    //enable or disable multivote for debug
    var query;
    if(true){
        query = {_id: req.params.id};
    } else {
        query = {_id: req.params.id, voters: {$not: {$all: [user._id]}}}; 
    }        
    if(optionId === "new"){
        Poll.findOneAndUpdate(
            query,
            {$addToSet: {pollOptions: {option: req.body.newOption, count: 1}}},
            {new: true},
            function(err, poll){
                if(err){                    
                    debug.log("ERROR VOTING WITH NEW OPTION");
                    debug.log(err); 
                    req.flash("error", Message.Error); 
                    return res.redirect("/polls");
                } else {
                    //nesting second query because you cannot use two $addToSet calls together.  Dumb.
                    Poll.findOneAndUpdate(
                        {_id: req.params.id},
                        {$inc: {votes: 1}},
                        {new: true},
                        function(err, secondPoll){
                            if(err){
                                debug.log("ERROR CHECKING FOR EXISTING VOTE FROM USER");
                                debug.log(err); 
                                req.flash("error", Message.Error); 
                                return res.redirect("/polls");
                            } else {
                                if(secondPoll){
                                    //redirect somehwere (show page)
                                    req.flash("success", Message.VoteSuccess);
                                    return res.redirect("back");
                                } else {
                                    req.flash("error", Message.VoteOnlyOnce);
                                    return res.redirect("/index");     
                                }                                
                            }
                        }
                    );                    
                }
        });
    } else {        
        //enable or disable multivote for debug   
        if(true){
            query = {_id: req.params.id, "pollOptions._id": optionId};
        } else {
            query = {_id: req.params.id, "pollOptions._id": optionId, voters: {$not: {$all: [user._id]}}}; 
        }    
        //record already exists, so update it with new vote and voter
        Poll.findOneAndUpdate(
            query,
            {$inc: { "pollOptions.$.count" : 1 }},
            {new: true},
            function(err, poll){
                if(err){
                    debug.log("ERROR VOTING FOR EXISTING OPTION"); 
                    debug.log(err); 
                    req.flash("error", Message.Error); 
                    return res.redirect("/polls");
                } else {
                    Poll.findOneAndUpdate(
                        query,
                        {$inc: {votes: 1}},
                        {new: true},
                        function(err, poll){
                            if(poll){
                                //redirect somehwere (show page)
                                req.flash("success", Message.VoteSuccess);
                                return res.redirect("back");
                            } else {
                                req.flash("error", Message.VoteOnlyOnce);
                                return res.redirect("back");     
                            }
                        });
                    
                    
                }
        });     
    }
});


//DESTROY POLL ROUTE
// note: add in middleware to check if user is logged in and has voted already
// checkPollOwnership is broken so hard!
router.delete("/:id", checkPollOwnership, function (req, res){
    //find and update the correct campground
    debug.log("DELETING POLL:" + req.params.id);   
    Poll.findByIdAndRemove(req.params.id, function(err){
      if(err){
        debug.log("ERROR DELETING POLL"); 
        debug.log(err); 
        req.flash("error", Message.Error); 
        return res.redirect("/polls");
      } else {
        //redirect somehwere (show page)
        req.flash("success", Message.DeleteSuccess);
        return res.redirect("/polls");
      }
    });
});

module.exports = router;