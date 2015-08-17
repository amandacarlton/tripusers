require('dotenv').load();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session= require('cookie-session');
var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');
var comments = require('./routes/comments');
var trips = require('./routes/trips');

var app = express();
app.set('trust proxy', 1);

app.use(session({
  name: 'session',
  keys: [process.env.KEY1, process.env.KEY2]
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var setUserNameLocal = function (req, res, next) {
  res.locals.currentUser = req.session.user;
  res.locals.currentId = req.session.uId
  next();
};

app.use(setUserNameLocal);


app.use('/', routes);

app.use('/users', users);
app.use('/', auth);
app.use('/', comments);
app.use('/', trips);
// app.use(function (req, res, next) {
//
//   if(req.session.user){
//     next();
//   }else{
//     res.redirect('/login');
//   }
// });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
