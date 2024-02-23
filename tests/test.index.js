const request = require('supertest');
const { expect } = require('expect');

const app = require('../src/index.js');

describe('Testing POSTS/answers endpoint', () => {
  it('respond with valid HTTP status code and description and message', () => {
    request(app)
      .get('/')
      .end((err, response) => {
        if (err) {
          return done(err);
        }
        expect(response.status).toBe(200);
        expect(response.text).toBe('Hello world!');
      });
  });
});
