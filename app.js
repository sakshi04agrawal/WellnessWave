if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const methodOverride = require('method-override');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const Joi = require('joi');
const User = require('./models/user');
const Blog = require('./models/blog');
const Comment = require('./models/comment');
const { blogSchema, commentSchema } = require('./schema.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const dbUrl = process.env.DB_URL
const MongoDBStore = require("connect-mongo");


const blogRoutes = require('./routes/blogs');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');


//'mongodb://127.0.0.1:27017/BLOG'
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(dbUrl,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    });
    console.log("Database Connected!!!! ");
}

const sessionConfig = {
    name: 'session',
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const fontSrcUrls = [];



app.use(session(sessionConfig));
app.use(flash());
// app.use(
//     helmet({
//         contentSecurityPolicy: false,
//     })
// );


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/blogs', blogRoutes);
app.use('/blogs/:id/comments', commentRoutes);
app.use('/', userRoutes);

app.get('/about', (req, res) => {
    res.render('about')
})
app.get('/', (req, res) => {
    res.render('index');
})
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went WRONG!!!';
    res.status(statusCode).render('error', { err });
})
const PORT = process.env.ONPORT||7000;
app.listen(PORT, () => {
    console.log("listening on port!!");
})
