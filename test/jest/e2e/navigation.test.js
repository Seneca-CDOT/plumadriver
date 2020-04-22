const request = require('supertest');
const nock = require('nock');

const { app } = require('../../../build/app');
const { createSession } = require('./helpers');

describe('Navigation', () => {
  let sessionId;

  beforeAll(async () => {
    nock(/plumadriver\.com/)
      .get('/')
      .delay(100)
      .reply(
        200,
        `<html>
        <head>
          <title>Test Page</title>
        </head>
      </html>`,
      );

    sessionId = await createSession(request, app);
  });

  it('navigates to a page and responds with null', async () => {
    const url = 'http://plumadriver.com/';
    const { body } = await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url,
      });
    expect(body).toStrictEqual({
      value: null,
    });

    const {
      body: { value },
    } = await request(app).get(`/session/${sessionId}/url`);
    expect(value).toBe(url);
  });

  it('throws invalid argument on improperly formatted url', async () => {
    const {
      body: {
        value: { error },
      },
    } = await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'foo://plumadriver.com',
      })
      .expect(400);

    expect(error).toBe('invalid argument');
  });

  it.skip('throws error on timeout', async () => {
    const requestedTimeouts = {
      pageLoad: 0,
    };

    await request(app)
      .post(`/session/${sessionId}/timeouts`)
      .send(requestedTimeouts)
      .expect(200);

    const {
      body: {
        value: { error },
      },
    } = await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://plumadriver.com',
      })
      .expect(200);

    expect(error).toBe('invalid argument');
  });
});
