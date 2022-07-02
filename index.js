'use strict';
/* eslint-disable no-console */
const http = require('http');

if (process.env.NODE_ENV !== 'production') {
  // Only used for typing
  // eslint-disable-next-line no-unused-vars
  const e = require('express');
}

const DEFAULT_LOGGER = {
  debug: console.log,
  info: console.log,
  warn: console.warn,
  error: console.error,
};

const VALID_HTTP_STATUS_CODES = Object.keys(http.STATUS_CODES).map((status) => {
  return parseInt(status, 10);
});

/**
 *
 * @param logger {{debug: function, info: function, warn: function, error: function}}
 * @returns {(function(e.Request, e.Response))}
 */
module.exports = function (logger = DEFAULT_LOGGER) {
  return function (req, res) {
    logger.debug(`Got error on ${req.method} ${req.url}`);
    const error = req?.error;
    const message =
      req?.error?.message || req?.error?.toString() || req?.message || 'Internal Server Error';

    if (typeof error === 'undefined') {
      //We have no error set on the request object, weird, I guess we just respond with a generic 500 error
      logger.warn(`No error set on request object, responding with 500`);
      logger.debug(`Req message: ${req?.message || req?.toString()}`);
      res.status(500).send(message);
      return;
    }

    if (!VALID_HTTP_STATUS_CODES.includes(error.status)) {
      logger.warn(`Invalid error status code ${error.status}, responding with 500`);
      logger.debug(`Error message: ${message}`);
      // We might want to always send 'Internal Server Error' here for safety
      // since we don't know where the error came from
      res.status(500).send(message);
      return;
    }

    logger.debug(`Responding with ${error.status} ${message}`);
    res.status(error.status).send(message);
  };
};
