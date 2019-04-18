var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var accountRouter = require('./routes/account');
var campaignRouter = require('./routes/campaign');

var app = express();

// session
app.use(session({secret: "promohunter"}));
app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});

// mlab mongoDB setup
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://promohunter:promohunter@promohunterdb-szcd7.mongodb.net/test?retryWrites=true', (err) => {
	if(err){
		console.log("Connection error: "+err);
	}else{
		console.log("Connected to mlab MongoDB");
	}
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/coupon_pictures', express.static(path.join(__dirname, 'coupon_pictures')));
app.use('/merchant_images', express.static(path.join(__dirname, 'merchant_images')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/account', accountRouter);
app.use('/campaign', campaignRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;