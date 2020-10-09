const request = require('supertest');
const nock = require('nock');

const { default: app } = require('../../../build/app');
const { createSession } = require('./helpers');
const { ELEMENT } = require('../../../build/constants/constants');

describe('Get Active Element', () => {
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
            <select>
              <option value="foo" style="visibility: none;"></option>
            </select>
          </body>
        </html>`,
      );

    sessionId = await createSession(request, app);
    await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://plumadriver.com',
      })
      .expect(200);
  });

  it('returns body as default active element', async () => {
    const {
      body: {
        value: { [ELEMENT]: elementId },
      },
    } = await request(app)
      .get(`/session/${sessionId}/element/active`)
      .expect(200);

    const {
      body: { value: tagName },
    } = await request(app)
      .get(`/session/${sessionId}/element/${elementId}/name`)
      .expect(200);

    expect(tagName).toBe('BODY');
  });

  it('returns proper value after clicking an option element', async () => {
    const {
      body: {
        value: { [ELEMENT]: elementId },
      },
    } = await request(app)
      .post(`/session/${sessionId}/element`)
      .send({ using: 'css selector', value: 'option' })
      .expect(200);

    await request(app).post(`/session/${sessionId}/element/${elementId}/click`);

    const {
      body: {
        value: { [ELEMENT]: activeElementId },
      },
    } = await request(app)
      .get(`/session/${sessionId}/element/active`)
      .expect(200);

    const {
      body: { value: localName },
    } = await request(app)
      .get(`/session/${sessionId}/element/${activeElementId}/name`)
      .expect(200);

    expect(localName).toBe('SELECT');
  });
});
