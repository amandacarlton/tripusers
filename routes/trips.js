var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var dbQueries = require('../lib/dbqueries.js');

// TODO: in dbQueries return a promise that
// yields the dashboard object (3 lines)
router.get('/trip', function (req, res, next) {
  dbQueries.userdashboard(req.session.uId).then(function (results) {
    return dbQueries.getDashboardInfo(results);
  }).then(function (dashboard) {
    if(dashboard.comments.length){
       dbQueries.getTrips(dashboard.comments).then(function (comments) {
        dashboard.comments = comments;
      });
    }
      res.render("trips/trip", {dashboard:dashboard});
  });
});

router.get('/trip/new', function (req, res, next) {
  res.render('trips/new');
  });

router.post('/trip/new', function (req, res, next) {
  var tripinfo = req.body;
  var userinfo = req.session.uId;
  dbQueries.newtrip(tripinfo, userinfo).then(function () {
    res.redirect("/trip");
  });
});

router.get('/trip/:id', function (req, res, next) {
  var tripid = req.params.id;
  dbQueries.tripshow(tripid).then(function (show) {
    if(show.comments.length>0){
      var promiseUser = show.comments.map(function (comment, i) {
        return dbQueries.findUserById(comment).then(function (person) {
          show.comments[i].userEmail = person.email;
        });
      });
      Promise.all(promiseUser).then(function () {
        res.render("trips/show", {show:show});
      });
    }else{
      res.render("trips/show", {show:show});
    }
  });
});

router.post('/comment/:id', function (req, res, next) {
  var info = req.params.id;
  var userinfo = req.session.uId;
  var bodyinfo = req.body.comment;
  dbQueries.newcomment(info, userinfo, bodyinfo).then(function () {
    res.redirect("/trip/"+req.params.id);
  });
});

router.post('/invite/:id', function (req, res, next) {
  var bodyinfo = req.body.invite;
  var idinfo = req.params.id;
  dbQueries.newinvite(bodyinfo, idinfo).then(function () {
    res.redirect("/trip/"+req.params.id);
  });
});


router.get('/trip/:id/edit', function (req, res, next) {
  var idinfo = req.params.id;
  dbQueries.gettripedit(idinfo).then(function (trip) {
    res.render("trips/edit", {trip:trip});
  });
});

router.post('/trip/:id/edit', function (req, res, next) {
  var idinfo = req.params.id;
  var bodyinfo = req.body;
  var userinfo = req.session.uId;
  dbQueries.getpostedit(idinfo, userinfo, bodyinfo)
  .then(function (trip) {
    res.redirect("/trip/"+req.params.id);
  });
});

router.post('/trip/:id/delete', function (req, res, next) {
  var idinfo = req.params.id;
  dbQueries.deletetrip(idinfo).then(function () {
    res.redirect("/trip");
  });
});

router.get('/comment/:id/:trip', function (req, res, next) {
  var idinfo = req.params.id;
  dbQueries.deletecomment(idinfo).then(function () {
    res.redirect("/trip");
  });
});

router.post('/comment/:id/:trip', function (req, res, next) {
  var idinfo = req.params.id;
  dbQueries.deletecomment(idinfo).then(function () {
    res.redirect("/trip/"+req.params.trip);
  });
});

router.get('/logout', function(req, res, next) {
  req.session=null;
  res.redirect('/');
});

router.post('/logout', function(req, res, next) {
  req.session=null;
  res.redirect('/');
});

module.exports = router;
