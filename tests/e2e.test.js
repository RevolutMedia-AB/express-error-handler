'use strict';
/* eslint-disable no-console */
const express = require('express');
const superagent = require('superagent');
const chai = require('chai');

const errorHandler = require('../index');
const expect = chai.expect;

describe('given an express app', function () {
  const app = express();
  let server;
  before(function () {
    app.use(express.json());
    server = app.listen(1234, () => {
      console.log(`Test listening on 1234`);
    });
  });

  describe('given a express handler', function () {
    app.get(
      '/no-error',
      function (req, res, next) {
        next();
      },
      errorHandler()
    );
    app.get(
      '/418-error',
      function (req, res, next) {
        const error = new Error('I really like tea');
        error.status = 418;
        req.error = error;
        next();
      },
      errorHandler()
    );

    context('when the handler calls next without an error', function () {
      it('should respond with generic 500 message', function () {
        return superagent
          .get('http://localhost:1234/no-error')
          .then(() => {
            expect.fail('We should not get a successful response');
          })
          .catch((err) => {
            expect(err.status).to.equal(500);
            expect(err.response.body).to.deep.equal({error: 'Internal Server Error'});
          });
      });
    });

    context('when the handler calls next with an expectantly formatted error', function () {
      it("should respond with the error's status and message", function () {
        return superagent
          .get('http://localhost:1234/418-error')
          .then(() => {
            expect.fail('We should not get a successful response');
          })
          .catch((err) => {
            expect(err.status).to.equal(418);
            expect(err.response.body).to.deep.equal({error: 'I really like tea'});
          });
      });
    });
  });

  after(() => {
    server?.close();
  });
});
