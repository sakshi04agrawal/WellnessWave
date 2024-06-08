const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');
const commentSchema = new Schema({
    body: {
        type: String
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model("Comment", commentSchema);