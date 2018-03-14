const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//Routes which should handle requests 
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');

mongoose.connect(
  'mongodb://node-admin:' +
  process.env.MONGO_ATLAS_PW +
  process.env.DB_PATH
);

mongoose.Promise = global.Promise; // Use the default Node.js Promise


app.use(morgan('dev')); //log requests 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


/*Handle CORS*/
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === 'Options') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
    return res.statusCode(200).json({});
  }
  next();
});


/*Routes*/
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);



/*Handle error when req doesn't match a route*/
app.use((req, res, next) => {
  const error = new Error('Not Found!');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});


module.exports = app;