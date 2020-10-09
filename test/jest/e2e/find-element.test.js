const request = require('supertest');
const nock = require('nock');

const { default: app } = require('../../../build/app');
const { createSession } = require('./helpers');
const { ELEMENT } = require('../../../build/constants/constants');

describe('Find Element', () => {
  let sessionId;

  beforeAll(async () => {
    nock(/plumadriver\.com/)
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

  it('throws stale element reference error on removed element', async () => {
    const {
      body: {
        value: { [ELEMENT]: elementId },
      },
    } = await request(app)
      .post(`/session/${sessionId}/element`)
      .send({ using: 'css selector', value: 'h1' })
      .expect(200);

    expect(typeof elementId).toBe('string');

    await request(app)
      .post(`/session/${sessionId}/execute/sync`)
      .send({
        script:
          "const h1 = document.querySelector('h1'); h1.parentNode.removeChild(h1)",
        args: [],
      })
      .expect(200);

    const {
      body: { value },
    } = await request(app)
      .post(`/session/${sessionId}/element/${elementId}/elements`)
      .send({ using: 'css selector', value: 'foo' })
      .expect(404);

    expect(value.error).toBe('stale element reference');
  });
});
