const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const passport = require('passport');
const Blog = require('../models/blog');
const { isLoggedIn, validateBlog, isAuthor } = require('../middleware');

router.get('/register', (req, res) => {
    res.render('user/register');
})

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
            req.flash('success', "Successfully, Registered!!");
            res.redirect('/blogs');
        });

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }

}));
router.get('/login', (req, res) => {
    res.render('user/login');
})
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), (req, res) => {
    req.flash('success', "Successfully LOGGED IN!");
    const redirectUrl = req.session.returnTo;
    res.redirect(redirectUrl || '/blogs');
})
router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', "You logged Out Successfully!!");
        res.redirect('/blogs');
    });
})

router.get('/profile', isLoggedIn, catchAsync(async (req, res) => {
    // const blogs = await Blog.find({}).populate({
    //     path: 'comments',
    //     populate: {
    //         path: 'author'
    //     }
    // }).populate('author');
    res.render('blogs/profile');
}));
router.get('/yrblogs', isLoggedIn, catchAsync(async (req, res) => {
    const blogs = await Blog.find({}).populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).populate('author');
    res.render('blogs/yrblogs', { blogs });
}))
router.get('/likedblogs', isLoggedIn, catchAsync(async (req, res) => {
    const blogs = await Blog.find({}).populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).populate('author');
    res.render('blogs/likedblogs', { blogs });
}))
router.get('/cmtblogs', isLoggedIn, catchAsync(async (req, res) => {
    const blogs = await Blog.find({}).populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).populate('author');
    res.render('blogs/cmtblogs', { blogs });
}))

module.exports = router;