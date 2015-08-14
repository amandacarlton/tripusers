var express = require('express');
var router = express.Router();
// var db = require('monk')('localhost/tripusers');
// var users = db.get('users');
var bcrypt = require('bcrypt');
var dbQueries = require('../lib/dbqueries.js');



router.get("/signup", function (req, res, next) {
  res.render("users/signup");
});

router.post("/signup" , function (req, res, next) {
  var bodyinfo = req.body;
  dbQueries.signup(bodyinfo)
  .then(function () {
    res.redirect("/");
  });
});


router.post("/login", function (req, res, next) {
  var bodyinfo = req.body;
  dbQueries.userlogin(bodyinfo).then(function (data) {
    if(data){
      req.session.user=data.email;
      req.session.uId=data._id;
      var compare= data.password;
      var statement;
      if (bcrypt.compareSync(req.body.password, compare)){
        res.redirect("/");
      }else{
        statement="Password does not match";
        res.render("index", {statement:statement});
      }
    }
    else{
      var message="Email does not exist";
      res.render("index", {message:message});
    }
  });
});

router.get("/user/edit", function (req, res, next) {
  var userinfo = req.session.uId;
  dbQueries.edituser(userinfo).then(function (person) {
    console.log(person);
    res.render("users/edit", {person:person});
  });
});

module.exports = router;
