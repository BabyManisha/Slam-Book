// Who follows You (Who Added youo as Friends)
const express = require("express");
const router = express.Router();
const User = require("../../models/user");

router.get("/", (req, res) => {
    const userDetails = req.user;

    User.findById({_id: userDetails._id}).populate({
        path: 'fans'
    }).exec((err, user) => {
        res.render("fans", {userDetails: userDetails, people: user.fans});
    });
    
});


module.exports = router;