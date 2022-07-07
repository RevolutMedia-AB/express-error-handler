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
const DEFAULT_ERROR = {message: 'Internal Server Error', status: 500};

const VALID_HTTP_STATUS_CODES = Object.keys(http.STATUS_CODES).map((status) => {
  return parseInt(status, 10);
});

const UNWANTED_MESSAGES = ['[object Object]', 'undefined', 'Error'];

/**
 *
 * @param logger {{debug: function, info: function, warn: function, error: function}}
 * @param fallbackError {{message: string, status: number}}
 * @returns {(function(e.Request, e.Response))}
 */
module.exports = function (logger = DEFAULT_LOGGER, fallbackError = DEFAULT_ERROR) {
  const _logName = '@ExpressErrorHandler';
  const _logger = {
    debug: (msg, ...args) => logger.debug(`${_logName}: ${msg}`, ...args),
    info: (msg, ...args) => logger.info(`${_logName}: ${msg}`, ...args),
    warn: (msg, ...args) => logger.warn(`${_logName}: ${msg}`, ...args),
    error: (msg, ...args) => logger.error(`${_logName}: ${msg}`, ...args),
  };

  return function (req, res) {
    _logger.debug(`Got error on ${req.method} ${req.url}`);
    const error = req?.error;
    let message = req?.error?.message || req?.error?.msg || req?.message || req?.error?.toString();
    if (typeof message === 'undefined' || UNWANTED_MESSAGES.includes(message)) {
      message = fallbackError.message;
    }

    if (typeof error === 'undefined') {
      //We have no error set on the request object, we will respond with the fallback error
      _logger.warn(`No error set on request object, responding with ${fallbackError.status}`);
      _logger.debug(`Req message: ${req?.message || req?.toString()}`);
      res.status(fallbackError.status).json({error: message});
      return;
    }

    if (!VALID_HTTP_STATUS_CODES.includes(error.status)) {
      _logger.warn(`Invalid error status code ${error.status}, responding with 500`);
      _logger.debug(`Error message: ${message}`);
      // We might want to always send 'Internal Server Error' here for safety
      // since we don't know where the error came from
      res.status(500).json({error: message});
      return;
    }

    _logger.debug(`Responding with ${error.status}: ${message}`);
    res.status(error.status).json({error: message});
  };
};
