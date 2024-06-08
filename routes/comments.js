const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Blog = require('../models/blog');
const Comment = require('../models/comment');
const { blogSchema, commentSchema } = require('../schema.js');
const { isLoggedIn, validateComment, isCommentAuthor } = require('../middleware');


router.post('/', isLoggedIn, validateComment, catchAsync(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    const comment = new Comment(req.body.comment);
    comment.author = req.user._id;
    blog.comments.push(comment);
    await comment.save();
    await blog.save();
    req.flash('success', 'Successfully added Comment!')
    res.redirect(`/blogs/${blog._id}`);
}))
router.delete('/:commentId', isLoggedIn, isCommentAuthor, catchAsync(async (req, res) => {
    const { id, commentId } = req.params;
    await Blog.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);
    req.flash('success', "Deleted the Review!");
    res.redirect(`/blogs/${id}`);
}))

module.exports = router;