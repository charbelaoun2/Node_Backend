var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var donationRouter = require('./routes/donationRouter');
var commentRouter = require('./routes/commentRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var config = require('./config')
const uploadRouter = require('./routes/uploadRouter');
const mongoose = require('mongoose');

const Donations = require('./models/donations');

const url = config.mongoUrl;
const connect = mongoose.connect(url, { useFindAndModify: false });

connect.then((db) => {
  console.log("Connected correctly to server");
}, (err) => { console.log(err); });

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(passport.initialize());



app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/donations',donationRouter);
app.use('/comments',commentRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leaderRouter);
app.use('/imageUpload',uploadRouter);

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
