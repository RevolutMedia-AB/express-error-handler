'use strict';
const express = require('express');
const errorHandler = require('./index');
const app = express();
const router = express.Router();

const handler200 = (req, res) => {
  // Everything is always good in this handler, `next` is never called
  res.status(200).json({message: "Damn I'm so good I never fail"});
};

const handler404Error = (req, res, next) => {
  // Code that looks something up that might or might not exists

  // The thing was not found
  const notFoundErr = new Error('Not found!');
  notFoundErr.status = 404;
  req.error = notFoundErr;
  next();
};

const handler404Object = (req, res, next) => {
  // Code that looks something up that might or might not exists

  // The thing was not found
  req.error = {message: 'Not found!', status: 404};
  next();
};

const handler500 = (req, res, next) => {
  // Code that does stuff and has a catch all for unexpected errors

  // Unexpected error was raised
  next();
};

const basicErrorHandler = errorHandler();
router.get('/example/200', handler200, basicErrorHandler); // Responds 200: {message: "Damn I'm so good I never fail"}
router.get('/example/404/error', handler404Error, basicErrorHandler); // Responds 404: {error: "Not Found!"}
router.get('/example/404/object', handler404Object, basicErrorHandler); // Responds 404: {error: "Not Found!"}
router.get('/example/500', handler500, basicErrorHandler); // Responds 500: {error: "Internal Server Error"}

app.use(router);

// Catch any route not registered and use the error handler's fallback error to make it respond with 404 instead of 500
const notFoundErrorHandler = errorHandler(undefined, {message: 'Not Found!', status: 404});
app.get('*', notFoundErrorHandler);

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on 3000`);
});
