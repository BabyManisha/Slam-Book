const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const Question = require("./question.js");
// const Questions = mongoose.model('Questions');

const UserSchema = mongoose.Schema({
    userId: String,
    authType: String,
    username: String,
    profilePic: String,
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    fans: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    questions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Questions"
        }
    ],
    questionsAsked: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Questions"
        }
    ],
    questionsLiked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Questions"
      }
    ],
    addedDefaults: Boolean,
},{
    timestamps: true
});

UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', UserSchema);
