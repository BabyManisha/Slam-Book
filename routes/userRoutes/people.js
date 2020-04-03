const express = require("express");
const router = express.Router();
const User = require("../../models/user");

router.get("/", (req, res) => {
    const userDetails = req.user;

    User.find((err, people) => {
        if(err){
            console.log("Something went wrong", err);
            people = [];
        }
        res.render("people", {userDetails: userDetails, people: people});
    });
    
});


module.exports = router;