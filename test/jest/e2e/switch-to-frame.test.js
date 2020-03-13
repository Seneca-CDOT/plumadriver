const request = require('supertest');
const nock = require('nock');

const { app } = require('../../../build/app');
const { createSession } = require('./helpers');
const { ELEMENT } = require('../../../build/constants/constants');

describe('Switch to Frame', () => {
  let sessionId;

  beforeEach(async () => {
    nock('http://plumadriver.com')
      .get('/frame_a.html')
      .reply(
        200,
        `<!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Test Page</title>
        </head>
        <body>
          <h1>Frame A</h1>
        </body>
      </html>
      `,
      );

    nock('http://plumadriver.com')
      .get('/')
      .reply(
        200,
        `<!DOCTYPE html>
        <html lang="en">
          <head>
            <title>Test Page</title>
          </head>
          <body>
            <h1>Test</h1>
            <iframe ></iframe>
          </body>
        </html>
        `,
      );

    sessionId = await createSession(request, app);
    await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://plumadriver.com',
      });
  });

  it('switches to frames', async () => {
    const {
      body: { value },
    } = await request(app)
      .post(`/session/${sessionId}/execute/sync`)
      .send({
        script: "return document.body.outerHTML",
        args: [],
      });

    console.log(value);
  });
});
