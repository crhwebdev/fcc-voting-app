var mongoose = require("mongoose");

var PollSchema = new mongoose.Schema({
    name: String,
    question: String,
    date: {type: Date, default: Date.now },
    pollOptions: [
        {
            _id: {type: mongoose.Schema.Types.ObjectId, default: mongoose.Types.ObjectId},
            option: String,
            count: {type: Number, default: 0},
            voters: [String]            
        }
    ],    
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        name: String
    }
});

//initialize Campground model
module.exports = mongoose.model("Polls", PollSchema);