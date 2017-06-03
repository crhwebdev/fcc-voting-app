const ObjectID = require('mongodb').ObjectID;
const db = require('./database.js');

exports.create = function(user, pollName, optionNames, cb){
    let collection = db.get().collection('polls');
    let pollOptions = [];
    let poll = {};
    let option;
     
    //{_id: null, option: 'George Washington', count: 0} $oid    
    poll.name = pollName;
    poll.by = user.name;
    //need to iterate through pollOptions and unpack into object
    for(let i = 0; i < optionNames.length; i++){
        option = Object.create(null);
        option._id = i;
        option.option = optionNames[i];
        option.count = 0;
        pollOptions.push(option); 
    }
    poll.pollOptions = pollOptions;
    //call db method to create new record
    collection.insert(poll);
    
};

exports.delete = function(id, cb){
    let collection = db.get().collection('polls');
    let _id = ObjectID(id);
    collection.remove({_id: _id}, {w:1}, (err, deleteRes)=>{
        if(err){
            return cb(err);
        } else {
            return cb(null, deleteRes);
        }
    });
}

//get
exports.getById = function(id, cb){
    let collection = db.get().collection('polls');
    let _id = ObjectID(id);
    collection.findOne({_id: _id}, (err, poll)=>{
        if(err){
            return cb(err);
        } else {
            return cb(null, poll);
        }
    });
};

//get all polls from database
exports.getAll = function(cb){
    let collection = db.get().collection('polls');
    collection.find().toArray((err, polls)=>{
        if(err){
            return cb(err);
        } else {
            return cb(null, polls);
        }        
    });
};

//get all polls by user
exports.getAllByUser = function(user, cb){
    let collection = db.get().collection('polls');
    collection.find({by: user.name}).toArray((err, myPolls)=>{
        if(err){
            return cb(err);
        } else {
            return cb(null, myPolls);
        }        
    });
}