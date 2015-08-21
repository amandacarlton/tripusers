var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var dbQueries = require('../lib/dbqueries.js');
var trip;
// TODO: in dbQueries return a promise that
// yields the dashboard object (3 lines)
router.get('/trip', function (req, res, next) {
  dbQueries.populateDashboardInfo(req.session.uId).then(function (dashboard) {
    res.render("trips/trip", {dashboard:dashboard});
  });
});

router.get('/trip/new', function (req, res, next) {
  res.render('trips/new');
});

router.post('/trip/new', function (req, res, next) {
  dbQueries.newtrip(req.body, req.session.uId).then(function () {
    res.redirect("/trip");
  });
});


router.get('/trip/:id', function (req, res, next) {
  dbQueries.populateTripInfo(req.params.id).then(function (tripInfo) {
    res.render("trips/show", {show:tripInfo});
  });
});

router.post('/comment/:id', function (req, res, next) {
  dbQueries.newcomment(req.params.id, req.session.uId, req.body.comment).then(function () {
    res.redirect("/trip/"+req.params.id);
  });
});

router.post('/invite/:id', function (req, res, next) {
  dbQueries.newinvite(req.body.invite, req.params.id).then(function () {
    res.redirect("/trip/"+req.params.id);
  });
});


router.get('/trip/:id/edit', function (req, res, next) {
  dbQueries.gettripedit(req.params.id).then(function (trip) {
    res.render("trips/edit", {trip:trip});
  });
});

router.post('/trip/:id/edit', function (req, res, next) {
  dbQueries.getpostedit(req.params.id, req.session.uId, req.body)
  .then(function (trip) {
    res.redirect("/trip/"+req.params.id);
  });
});

router.post('/trip/:id/delete', function (req, res, next) {
  dbQueries.deletetrip(req.params.id).then(function () {
    res.redirect("/trip");
  });
});

router.get('/comment/:id/:trip', function (req, res, next) {
  dbQueries.deletecomment(req.params.id).then(function () {
    res.redirect("/trip");
  });
});

router.post('/comment/:id/:trip', function (req, res, next) {
  dbQueries.deletecomment(req.params.id).then(function () {
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
