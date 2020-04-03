const express = require("express");
const router = express.Router();
const User = require("../../models/user");
// Routes
const QuestionsRoute = require("./questions.js");
const AnswersRoute = require("./answers.js");
const PeopleRoute = require("./people.js");
const ProfileRoute = require("./profile.js");
const FriendsRoute = require("./friends.js");
const FansRoutes = require("./fans.js");


router.use("/questions", QuestionsRoute);
router.use("/answers", AnswersRoute);
router.use("/people", PeopleRoute);
router.use("/profile", ProfileRoute);
router.use("/friends", FriendsRoute);
router.use("/fans", FansRoutes);


router.post("/search", (req, res) => {
    const userDetails = req.user;
    const name = req.body.name;
    User.find({ "username": { "$regex": name, "$options": "i" } }, (err, people) => {{
        if(err){
            console.log("Something went wrong", err);
            people = [];
        }
        res.render("people", {userDetails: userDetails, people: people});
    }})
    
});

router.post("/friend", (req, res) => {
    const userDetails = req.user;
    const id = req.body.userid;
    User.findOneAndUpdate({_id: userDetails._id}, { "$push": { "friends": id }}, (err, user1) => {
        if(user1){
            User.findOneAndUpdate({_id: id}, { "$push": { "fans": userDetails._id }}, (err, user2) => {
                res.redirect(req.get('referer'));
            });
        }
    });
});

router.post("/unfriend", (req, res) => {
    const userDetails = req.user;
    const id = req.body.userid;
    User.findOneAndUpdate({_id: userDetails._id}, { "$pull": { "friends": id }}, (err, user1) => {
        if(user1){
            User.findOneAndUpdate({_id: id}, { "$pull": { "fans": userDetails._id }}, (err, user2) => {
                // res.status(200).json({'msg': "You are Friends!!"});
                res.redirect(req.get('referer'));
            });
        }
    });
});

module.exports = router;