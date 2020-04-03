//jshint esversion:6
require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');

// Models
const DefaultQuestion = require("./models/defaultQuestion");
const QuestionBank = require("./models/questionBank");

// Routes
const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes/index");

// Authentication Middileware
const isAuthenticated = require("./routes/isAuthenticated");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect(process.env.MONGO_DB, {useUnifiedTopology: true, useNewUrlParser: true});
mongoose.set("useCreateIndex", true);
mongoose.set('useFindAndModify', false);

// User Session Initiatives
app.use(session({
    secret: process.env.MYSECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


DefaultQuestion.find({}, (err, defaultQuestions) => {
    if(defaultQuestions.length <= 0){
        DefaultQuestion.insertMany(QuestionBank, (err, allQuestions) => {
            if(allQuestions && allQuestions.length){
                console.log("Default Questions Created Successfully!!");
            }else{
                console.log("Something went wrong, Deafult Questions are not getting Created!!");
            }
        })
    }else{
        console.log("Deafult Questions are already existed!!");
    }
})


app.use("/", homeRoutes);
app.use("/auth", authRoutes);
app.use("/user", isAuthenticated, userRoutes);
app.get("/smPage", (req, res) => {
    const userDetails = req.user;
    if(req.isAuthenticated() && userDetails.userId === process.env.ADMIN){
        res.render('partials/smPage');
    }else{
        res.redirect("/");
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is listening on: http://localhost:${process.env.PORT || 3000}`);
});