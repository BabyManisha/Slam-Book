const mongoose = require("mongoose");
const User = require("./user.js");
// const User = mongoose.model('User');

const QuestionSchema = mongoose.Schema({
    question: String,
    answer: String,
    askedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    askedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    likedBy: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
    ],
    subscribedBy: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
    ]
},{
    timestamps: true
});


module.exports = mongoose.model('Question', QuestionSchema);

