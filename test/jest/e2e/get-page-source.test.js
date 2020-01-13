const request = require('supertest');
const nock = require('nock');

const { app } = require('../../../build/app');
const { createSession } = require('./helpers');

describe('Get Page Source', () => {
  it('returns the serialized DOM', async () => {
    const testScript =
      "<script>document.querySelector('body').appendChild(document.createElement('h1'));document.querySelector('h1').textContent='test';</script>";

    nock(/plumadriver\.com/)
      .get('/')
      .reply(200, `<body>${testScript}</body>`);

    const sessionId = await createSession(request, app);
    await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://plumadriver.com',
      });

    const {
      body: { value },
    } = await request(app).get(`/session/${sessionId}/source`);

    const expectedValue = `<html><head></head><body>${testScript}<h1>test</h1></body></html>`;

    expect(value).toBe(expectedValue);
  });
});
