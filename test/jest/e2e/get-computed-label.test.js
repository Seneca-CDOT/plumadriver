const request = require('supertest');
const nock = require('nock');

const { default: app } = require('../../../build/app');
const { createSession } = require('./helpers');
const { ELEMENT } = require('../../../build/constants/constants');

describe('Get Computed Label', () => {
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
              <button aria-label="Close" onclick="myDialog.close()">X</button>
            </body>
          </html>
          `,
      );

    sessionId = await createSession(request, app);
    await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://plumadriver.com',
      })
      .expect(200);
  });

    it('returns the aria label', async () => {
      const {
        body: {
          value: { [ELEMENT]: elementId },
        },
      } = await request(app)
        .post(`/session/${sessionId}/element`)
        .send({ using: 'css selector', value: 'button' })

      const {
        body: { value },
      } = await request(app)
          .get(`/session/${sessionId}/element/${elementId}/computedlabel`)

      expect(value).toBe('Close');
    });
}); 
