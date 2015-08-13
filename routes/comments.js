var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/tripusers');
var users = db.get('users');
var bcrypt = require('bcrypt');



module.exports = router;
