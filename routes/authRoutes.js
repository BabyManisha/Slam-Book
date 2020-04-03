const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const router = express.Router();
const User = require("../models/user.js");
const Question = require("../models/question.js");
const DefaultQuestion = require("../models/defaultQuestion.js");

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALL_BACK,
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},function(accessToken, refreshToken, profile, cb) {
    saveUserDetails(accessToken, refreshToken, profile, cb, 'google');
}));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALL_BACK
}, function(accessToken, refreshToken, profile, cb) {
    saveUserDetails(accessToken, refreshToken, profile, cb, 'facebook');
}));

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_API_KEY,
    consumerSecret: process.env.TWITTER_SECRET_KEY,
    callbackURL: process.env.TWITTER_CALL_BACK
  },
  function(token, tokenSecret, profile, cb) {
    saveUserDetails(token, tokenSecret, profile, cb, 'twitter');
}));

function saveUserDetails(accessToken, refreshToken, profile, cb, authType){
    const userDetails = {
        userId: profile.id,
        authType: authType,
        username: profile.displayName,
        profilePic: profile.photos && profile.photos.length ? profile.photos[0]['value'] : '',
    }
    User.findOrCreate(userDetails, function (err, user) {
        if(!user.addedDefaults){
            DefaultQuestion.find({createdAt: {$lte: user.createdAt}}, (err, question)  => { 
                if(question && question.length > 0){
                    DefaultQuestion.find({}, (err, defaultQuestions) => {
                        defaultQuestions.forEach(function(defaultQuestion, index) {
                            let userid = user._id;
                            let questionData = new Question({
                                question: defaultQuestion.question,
                                answer: null,
                                askedBy: null,
                                askedTo: userid,
                                likedBy: [],
                                subscribedBy: []
                            });
                            questionData.save()
                            .then(question => {
                                User.findOneAndUpdate({_id: userid}, { "$push": { "questions": question._id }}, (err, user1) => {
                                    if(defaultQuestions.length-1 === index){
                                        User.findOneAndUpdate({_id: userid}, { "addedDefaults": true }, (err, user2) => {
                                            return cb(err, user);
                                        });
                                    }
                                });
                            })
                        });
                    })
                }else{
                    return cb(err, user);
                }
            });
        }else{
            return cb(err, user);
        }
    });
}



// for GoogleOAuth2.0 -- STRATS
router.get('/google', 
    passport.authenticate("google", { scope: ['profile'] })
);

router.get('/google/secrets', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect to secrets.
        res.redirect('/user/questions');
    });
// for GoogleOAuth2.0 -- ENDs


// for facebook -- STARTS
router.get('/facebook',
  passport.authenticate('facebook'));
 
router.get('/facebook/secrets',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/user/questions');
    });
// for facebook -- ENDS


// for twitter -- STARTS
router.get('/twitter', passport.authenticate('twitter'));

router.get('/twitter/secrets', 
    passport.authenticate('twitter', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/user/questions');
    });
// for twitter -- ENDS


module.exports = router;