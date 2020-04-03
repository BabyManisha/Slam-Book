const mongoose = require("mongoose");

const DeafultQuestionSchema = mongoose.Schema({
    question: String,
},{
    timestamps: true
});


module.exports = mongoose.model('DefaultQuestion', DeafultQuestionSchema);
