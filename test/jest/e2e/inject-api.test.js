const request = require('supertest');
const nock = require('nock');

const { default: app } = require('../../../build/app');
const { createSession } = require('./helpers');

describe('Injected APIs', () => {
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
        <body>
          <h1>Test</h1>
          <svg width="400" height="110">
             <rect width="200" height="50" style="fill:rgb(0,0,255); stroke-width:2; stroke:rgb(0,0,0)" />
          </svg>
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

  it('should not report error on HTMLElement.scrollIntoView', async () => {
    await request(app)
      .post(`/session/${sessionId}/execute/sync`)
      .send({
        script: 'document.querySelector("h1").scrollIntoView()',
        args: [],
      })
      .expect(200);
  });

  it('should return a number value from performance.timing.navigationStart', async () => {
    const {
      body: { value },
    } = await request(app)
      .post(`/session/${sessionId}/execute/sync`)
      .send({ script: 'return performance.timing.navigationStart', args: [] })
      .expect(200);

    expect(value).toEqual(expect.any(Number));
  });

  it('should have the proper return value for SVGRectElement.getBBox()', async () => {
    const {
      body: { value },
    } = await request(app)
      .post(`/session/${sessionId}/execute/sync`)
      .send({
        script: 'return document.querySelector("rect").getBBox()',
        args: [],
      })
      .expect(200);

    expect(value).toMatchObject({
      x: expect.any(Number),
      y: expect.any(Number),
      width: expect.any(Number),
      height: expect.any(Number),
    });
  });
});
