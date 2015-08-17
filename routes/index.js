var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("start");
  res.render('index', { title: 'Trip Start' });
});

module.exports = router;
