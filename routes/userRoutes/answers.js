const express = require("express");
const router = express.Router();
const Question = require("../../models/question.js");
const User = require("../../models/user.js");

router.get("/", (req, res) => {
    const userDetails = req.user;
    User.findById({_id: userDetails._id}).populate({
        path: 'questionsAsked',
        model: Question,
        populate: { path: 'askedTo' }
    })
    .exec((err, user) => {
        const questions = user.questionsAsked;
        questions.sort(function(a,b){
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        res.render("answers", {userDetails: userDetails, questions: questions});
    });
});


module.exports = router;