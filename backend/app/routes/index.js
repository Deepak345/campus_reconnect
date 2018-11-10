////////////////////////////////////////////////////////////////
///////////**** Routes for all the EJS Views/Pages ******///////
////////////////////////////////////////////////////////////////

var express = require('express');
var router = express.Router();

var postModel = require("../models/posts");
var userModel = require("../models/users");
var roomModel = require("../models/rooms");



/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});
/* GET profile page. */
router.get('/profile/:id', function(req, res, next) {
    if(req.session.user) {
        userModel.findById(req.params.id)
        .populate({ path: "posts", populate: {path: "comments.user"} })
        .exec(function(err, userDoc) {
            if(!userDoc) {
                res.send("No Such User Found!");
            } else {
                res.render("profile", { userProfile: userDoc, userSession: req.session.user });
            }
        });
    } else {
        res.redirect("/login");
    }
});
/* GET posts page. */
router.get('/posts', function(req, res, next) {

    if(req.session.user) {
        postModel.find({})
                .populate({ path: 'user' })
                .populate({ path: 'comments.user' })
                .exec(function(err, docs) {
                    if(err) throw err;
                    console.log("the posts: ", docs);
                    res.render('posts', { posts: docs, user: req.session.user });
                });
    } else {
        res.redirect("/login");
    }
});

/* GET chat page. */
router.get('/login', function(req, res, next) {
    res.render('login');
});

router.get('/chat', function(req, res, next) {
    if(req.session.user) {
        roomModel.find({ $where: "this.members.length > 2" })
                .populate("members", "name")
                .exec(function(err, doc) {
                    if(err) throw err;
                    console.log(doc);
                    res.render('chat', { rooms: doc, userSession: req.session.user });
                });
    } else {
        res.redirect("/login");
    }
});



module.exports = router;