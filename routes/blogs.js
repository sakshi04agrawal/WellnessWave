const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Blog = require('../models/blog');
const { blogSchema, commentSchema } = require('../schema.js');
const { isLoggedIn, validateBlog, isAuthor } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const { cloudinary } = require('../cloudinary');

router.get('/', catchAsync(async (req, res) => {
    const blogs = await Blog.find({}).populate({
        path: 'author'
    });
    res.render('blogs/index', { blogs });
}));
router.get('/new', isLoggedIn, (req, res) => {
    res.render('blogs/new');
})
router.post('/', isLoggedIn, upload.array('logo'), validateBlog, catchAsync(async (req, res, next) => {
    const blog = new Blog(req.body.blog);
    blog.logo = req.files.map(f => ({ url: f.path, filename: f.filename }));
    blog.author = req.user._id;
    await blog.save();
    // console.log(blog);
    req.flash('success', 'Successfully made a new Blog!!');
    res.redirect(`/blogs/${blog._id}`);
}));

router.get('/:id', catchAsync(async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!blog) {
        req.flash('error', 'Cannot find that Blog!!');
        res.redirect('/blogs');
    }
    res.render('blogs/show', { blog });
}));
router.get('/:id/like', isLoggedIn, catchAsync(async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
        if (blog.likes.includes(req.user._id)) {
            req.flash('error', "You already have liked this post");
            res.redirect(`/blogs/${blog._id}`);
        }
        else {
            const updatedblog = await Blog.findByIdAndUpdate(id, { $push: { likes: req.user._id } });
            await updatedblog.save();
            if (updatedblog.dislikes.includes(req.user._id)) {
                const user = req.user._id;
                const index = updatedblog.dislikes.indexOf(user);

                await updatedblog.dislikes.splice(index, 1);
                await updatedblog.save();
            }
            req.flash('success', 'Successfully LIKED!!');
            res.redirect(`/blogs/${blog._id}`);
        }
    } catch (error) {
        // console.error(error);
        // Handle the error appropriately
        req.flash('error', 'An error occurred');
        res.redirect(`/blogs/${id}`);
    }

}))
router.get('/:id/dislike', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (blog.dislikes.includes(req.user._id)) {
        req.flash('error', "You already have disliked this post");
        res.redirect(`/blogs/${blog._id}`);
    }
    else {
        const blog = await Blog.findByIdAndUpdate(id, { $push: { dislikes: req.user._id } });
        await blog.save();
        if (blog.likes.includes(req.user._id)) {
            const user = req.user._id;
            const index = blog.likes.indexOf(user);
            await blog.likes.splice(index, 1);
            await blog.save();
        }
        req.flash('success', 'Successfully DISLIKED!!');
        res.redirect(`/blogs/${blog._id}`);
    }

}))
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) {
        req.flash('error', 'Cannot find that Blog!!');
        res.redirect('/blogs');
    }
    if (!blog.author.equals(req.user._id)) {
        req.flash('error', "You can't do that!!");
        return res.redirect(`/blogs/${id}`);
    }
    res.render('blogs/edit', { blog });
}));
router.put('/:id', isLoggedIn, isAuthor, upload.array('logo'), validateBlog, catchAsync(async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const blog = await Blog.findByIdAndUpdate(id, { ...req.body.blog });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    blog.logo.push(...imgs);
    await blog.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await blog.updateOne({ $pull: { logo: { filename: { $in: req.body.deleteImages } } } });
        // console.log(blog);
    }
    req.flash('success', "Successfully updated the Blog!");
    res.redirect(`/blogs/${blog._id}`);
}));
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Blog.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted the Blog!")
    res.redirect('/blogs');
}));
module.exports = router;
