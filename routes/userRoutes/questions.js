const express = require("express");
const router = express.Router();
const DefaultQuestion = require("../../models/defaultQuestion.js");
const Question = require("../../models/question.js");
const User = require("../../models/user.js");

router.post("/add", function(req, res){
    const userDetails = req.user;
    const question = req.body.question;
    const askedTo = req.body.userid;

    const questionData = new Question({
        question: question,
        answer: null,
        askedBy: userDetails._id,
        askedTo: askedTo,
        likedBy: [],
        subscribedBy: []
    });

    questionData.save()
        .then( question => {
            User.findOneAndUpdate({_id: userDetails._id}, { "$push": { "questionsAsked": question._id }}, (err, user1) => {
                User.findOneAndUpdate({_id: askedTo}, { "$push": { "questions": question._id }}, (err, user2) => {
                    res.redirect(req.get('referer'));
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.redirect(req.get('referer'));
        });
    
});

router.post("/answer", function(req, res){
    const userDetails = req.user;
    const questionid = req.body.questionid;
    const answer = req.body.answer;

    Question.findByIdAndUpdate({_id: questionid}, {answer: answer}, (err, question) => {
        if(question) {
            res.redirect(req.get('referer'));
        }
    });
});

router.post("/like", function(req, res){
    const userDetails = req.user;
    const questionid = req.body.questionid;

    Question.findByIdAndUpdate({_id: questionid}, { "$push": { "likedBy": userDetails._id }}, (err, question) => {
        if(question) {
            User.findByIdAndUpdate({_id: userDetails._id}, { "$push": { "questionsLiked": questionid }}, (err, user) => {
                if(user) {
                    res.redirect(req.get('referer'));
                }
            });
        }
    });
});

router.post("/dislike", function(req, res){
    const userDetails = req.user;
    const questionid = req.body.questionid;

    Question.findByIdAndUpdate({_id: questionid}, { "$pull": { "likedBy": userDetails._id }}, (err, question) => {
        if(question) {
            User.findByIdAndUpdate({_id: userDetails._id}, { "$pull": { "questionsLiked": questionid }}, (err, user) => {
                if(user) {
                    res.redirect(req.get('referer'));
                }
            });
        }
    });
});

router.post("/subscribe", function(req, res){
    const userDetails = req.user;
    const questionid = req.body.questionid;

    Question.findByIdAndUpdate({_id: questionid}, { "$push": { "subscribedBy": userDetails._id }}, (err, question) => {
        if(question) {
            User.findByIdAndUpdate({_id: userDetails._id}, { "$push": { "questionsSubscribed": questionid }}, (err, user) => {
                if(user) {
                    res.redirect(req.get('referer'));
                }
            });
        }
    });
});

router.post("/unsubscribe", function(req, res){
    const userDetails = req.user;
    const questionid = req.body.questionid;

    Question.findByIdAndUpdate({_id: questionid}, { "$pull": { "subscribedBy": userDetails._id }}, (err, question) => {
        if(question) {
            User.findByIdAndUpdate({_id: userDetails._id}, { "$pull": { "questionsSubscribed": questionid }}, (err, user) => {
                if(user) {
                    res.redirect(req.get('referer'));
                }
            });
        }
    });
});

router.post("/toall", function(req, res){
    const userDetails = req.user;
    const question = req.body.question;

    const deafultQuestion = new DefaultQuestion({
        question: question
    });

    deafultQuestion.save()
    .then(defaultquestion => {
        User.find({}, function(err, users) {
            users.forEach(function(user, index) {
                let userid = user._id;
                let questionData = new Question({
                    question: question,
                    answer: null,
                    askedBy: null,
                    askedTo: userid,
                    likedBy: [],
                    subscribedBy: []
                });
                questionData.save()
                .then(question => {
                    User.findOneAndUpdate({_id: userid}, { "$push": { "questions": question._id }}, (err, user2) => {
                        if(users.length-1 === index){
                            res.status(200).json({'msg': "Successfully Added!!"});
                        }
                    });
                })
            });
        });  
    })
    .catch(err => {
        console.log(err);
        res.status(400).json({'msg': "Something went Wrong!!", 'error': err});
    });
    
});

router.get("/", (req, res) => {
    const userDetails = req.user;
    User.findById({_id: userDetails._id}).populate({
        path: 'questions',
        model: Question,
        populate: { path: 'askedBy' }
    })
    .exec((err, user) => {
        const questions = user.questions;
        questions.sort(function(a,b){
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        res.render("questions", {userDetails: userDetails, questions: questions});
    });
});


module.exports = router;