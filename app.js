var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const helmet = require("helmet");
const passport = require('passport');
const cookieSession = require("cookie-session");
var app = express();

require('./passport/authGoogle');
require('./passport/jwt');
let connectMongo=require("./config/databaseMongo")
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productsRouter = require('./routes/products');
var ordersRouter = require('./routes/orders');

app.use(cors());
app.use(helmet());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//for passport
app.use(cookieSession({
    // milliseconds of a day
    maxAge: 24*60*60*1000,
    keys:[process.env.COOKIE_KEY]
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  

app.use((req, res, next) => {
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range')
    next()
})


app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

module.exports = app;

