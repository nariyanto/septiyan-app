const express = require('express');
const logger = require('morgan');
const passport = require( 'passport');
import { connect } from './config/db';
import { client } from './config/redis';
import { restRouter } from './api';
import { configJWTStrategy } from './api/middlewares/passport-jwt';

const app = express();
const PORT = process.env.PORT || 3000;

connect();
client.on("error", function (err) {
  console.log("Error " + err);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(logger('dev'));
}
app.use(passport.initialize()); // req.user
configJWTStrategy();
app.get('/', function (req, res) {
  res.json({
    status: 'You found me!!',
    message: 'Hi, Jenius hiring team. Thank you for testing my app.'
  })
})
app.use('/api', restRouter);

app.use((req, res, next) => {
  const error = new Error('Not found');
  error.message = 'Invalid route';
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  return res.json({
    error: {
      message: error.message,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at PORT http://localhost:${PORT}`);
});