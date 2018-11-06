////////////////////////////////////////////////////////////////
///////////**** Routes for all the API calls ******/////////////
////////////////////////////////////////////////////////////////

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var ObjectId = mongoose.Types.ObjectId;


var postModel = require("../models/posts");
var userModel = require("../models/users");

/* Importing all the controllers. */ 


/* To test api route is working. */
router.get('/', function(req, res, next) {
  res.send('API is working');
});

router.post('/login', function(req, res, next) {
  var email = req.body.email.toLowerCase().trim();
  var password = req.body.password;
  console.log("email", email);
  console.log("password", password);
  userModel.findOne({ email: email})
                  .exec(function(err, doc) {
                    if(err) throw err;
                    if(!doc) {
                      res.json({ success: false, errorMsg: "Email not registered!" });
                    } else {
                      if(doc.password !== password) {
                        res.json({ success: false, errorMsg: "Wrong Password Entered!" });
                      } else {
                        req.session.user = doc;
                        delete req.session.user["password"];
                        res.json({ success: true, errorMsg: "" });
                      }
                    }
                  });
});


router.post('/new-post', function(req, res, next) {
  var post = {
    body: req.body.postBody,
    user: ObjectId(req.session.user._id),
    date: new Date()
  };
  var newPost = new postModel(post);
  newPost.save(function(err, doc) {
    if (err) throw err;
    res.json(doc);
  });
});



router.post('/new-like', function(req, res, next) {
  var id = req.body.id;
  postModel.findById(id, function(err, doc) {
    if(err) throw err;
    if(req.body.action === "true") { 
      doc.likes.push(ObjectId(req.session.user._id));
    } else {
      doc.likes.splice(doc.likes.indexOf(req.session.user._id), 1);
    }
    console.log("Length", ObjectId(req.session.user._id));
    doc.save(function(err, doc) {
      if(err) throw err;
      console.log(doc);
      res.send("Like updated successfully!"); 
    });
  });
});

router.post('/new-comment', function(req, res, next) {
  var id = req.body.id;
  var msg = req.body.msg;
  postModel.findById(id, function(err, doc) {
    if(err) throw err;
    doc.comments.push({user: ObjectId(req.session.user._id), comment: msg});
    console.log("HAHA", doc.comments[0]);
    doc.save(function(err, doc) {
      if(err) throw err;
      console.log(doc);
      res.send("Comments updated successfully!"); 
    });
  });
});

router.get('/logout', function(req, res, next) {
  req.session.destroy();
  res.send("Logged out successfully!");
});




module.exports = router;