'use strict';

const errorHandler = require('../index');

const chai = require('chai');
const expect = chai.expect;

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
});
