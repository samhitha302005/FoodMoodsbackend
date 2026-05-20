var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());

// ✅ MongoDB connection with caching (inside app.js)
let isConnected = false;

async function connectToMongo() {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB connected.');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
  }
}

// 🔁 Connect once when app starts (not in test)
if (process.env.NODE_ENV !== 'test') {
  connectToMongo();
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'assets')));

//Optional re-check connection in routes:
app.use(async (req, res, next) => {
  await connectToMongo();
  next();
});

const indexRouter = require('./routes/indexRouter');
const usersRouter = require('./routes/usersRouter');
const restaurantRouter = require('./routes/restaurantsRouter');
const dishRouter = require('./routes/dishesRouter');
const cartRouter = require('./routes/cartRouter');
const dishAvailabilityRouter = require('./routes/dishAvailabilityRouter');

app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/dishes', dishRouter);
app.use('/api/cart', cartRouter);
app.use('/api/dish-availability', dishAvailabilityRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

module.exports = app;
