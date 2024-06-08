const ExpressError = require('./utils/ExpressError');
const { blogSchema, commentSchema } = require('./schema.js');
const Blog = require('./models/blog');
const Comment = require('./models/comment');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You  must be signed In for that.');
        return res.redirect('/login');
    }
    next();
}


module.exports.validateBlog = (req, res, next) => {
    const { error } = blogSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog.author.equals(req.user._id)) {
        req.flash('error', "You can't do that!!");
        return res.redirect(`/blogs/${id}`);
    }
    next();
}

module.exports.isCommentAuthor = async (req, res, next) => {
    const { id, commentId } = req.params;
    const blog = await Comment.findById(commentId);
    if (!blog.author.equals(req.user._id)) {
        req.flash('error', "You can't do that!!");
        return res.redirect(`/blogs/${id}`);
    }
    next();
}
module.exports.validateComment = (req, res, next) => {
    const { error } = commentSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}