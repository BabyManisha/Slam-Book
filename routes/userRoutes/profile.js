const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const Question = require("../../models/question");

router.get("/:id", (req, res) => {
    const userDetails = req.user;
    const id = req.params.id;
    User.findById({_id: id}).populate({
        path: 'questions',
        model: Question,
        populate: { path: 'askedBy' }
    })
    .exec((err, user) => {
        const questions = user.questions;
        questions.sort(function(a,b){
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        res.render("profile", {userDetails: userDetails, profile: user, questions: questions});
    });
});

router.get("/", (req, res) => {
    const userDetails = req.user;
    res.render("profile", {userDetails: userDetails, profile: userDetails, questions: []});
});




module.exports = router;