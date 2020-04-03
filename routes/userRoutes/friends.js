// // Whom You Follow (Whom you added as Friends)
const express = require("express");
const router = express.Router();
const User = require("../../models/user");

router.get("/", (req, res) => {
    const userDetails = req.user;

    User.findById({_id: userDetails._id}).populate({
        path: 'friends'
    }).exec((err, user) => {
        res.render("friends", {userDetails: userDetails, people: user.friends});
    });
    
});


module.exports = router;