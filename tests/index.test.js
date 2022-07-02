'use strict';

const errorHandler = require('../index');

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const fail = expect.fail;

const mockExpressResponse = (expectedStatus, expectedMessage) => {
  return {
    status: function (statusCode) {
      return {
        send: function (message) {
          expect(statusCode).to.equal(expectedStatus);
          expect(message).to.equal(expectedMessage);
        },
      };
    },
  };
};

describe('given a Request and Response object', function () {
  context('when req.error is empty', function () {
    it('should be respond with generic 500 message', function () {
      const req = {};
      const res = mockExpressResponse(500, 'Internal Server Error');
      errorHandler()(req, res);
    });
  });

  context('when req.error is set to an error on the expected format', function () {
    it('should be respond with the error status and message provided', function () {
      const req = {
        error: {
          message: 'I really like tea',
          status: 418,
        },
      };
      const res = mockExpressResponse(418, 'I really like tea');
      errorHandler()(req, res);
    });
  });

  context('when req.error contains a non HTTP error status, like a DataStore error', function () {
    context('when req.error.message is empty', function () {
      it('should be respond with generic 500 message', function () {
        const req = {error: {status: 9}};
        const res = mockExpressResponse(500, 'Internal Server Error');
        errorHandler()(req, res);
      });
    });
    context('when req.error.message is set', function () {
      it('should be respond with specific 500 message', function () {
        const req = {error: {status: 9, message: 'DataStore Error'}};
        const res = mockExpressResponse(500, 'DataStore Error');
        errorHandler()(req, res);
      });
    });
  });
});

describe('given a logger', function () {
  context('when called with an expected req', function () {
    it('should log the method and path', function () {
      const url = 'https://localhost:3000/api/v1/mock';
      const mockedFallbackLogger = sinon.stub();
      const mockedDebugLogger = sinon.stub();
      const expectedFirstLog = `@ExpressErrorHandler: Got error on GET ${url}`;
      const expectedSecondLog = '@ExpressErrorHandler: Responding with 418: I really like tea';
      mockedFallbackLogger.callsFake(() => null);
      mockedDebugLogger.withArgs(expectedFirstLog).returns(true);
      mockedDebugLogger.withArgs(expectedSecondLog).returns(true);
      mockedDebugLogger.callsFake((msg) => {
        fail(`Should call the mocked logger with the expected message, instead got ${msg}`);
      });

      const error = {message: 'I really like tea', status: 418};
      const req = {url, method: 'GET', error};
      const res = mockExpressResponse(418, 'I really like tea');
      const mockedLogger = {
        debug: mockedDebugLogger,
        info: mockedFallbackLogger,
        warn: mockedFallbackLogger,
        error: mockedFallbackLogger,
      };
      errorHandler(mockedLogger)(req, res);
    });
  });
});
