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
          <h1>FrameA</h1>
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
            <h1>Top</h1>
            <iframe name="foo" src="frame_a.html"></iframe>
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

  const getHeaderText = async () => {
    const {
      body: { value: headerText },
    } = await request(app)
      .post(`/session/${sessionId}/execute/sync`)
      .send({
        script: 'return document.querySelector("h1").textContent',
        args: [],
      })
      .expect(200);

    return headerText;
  };

  it('switches to frame by number and null', async () => {
    const {
      body: { value },
    } = await request(app)
      .post(`/session/${sessionId}/frame`)
      .send({
        id: 0,
      })
      .expect(200);

    expect(value).toBe(null);

    expect(await getHeaderText()).toBe('FrameA');

    await request(app)
      .post(`/session/${sessionId}/frame`)
      .send({
        id: null,
      })
      .expect(200);

    expect(await getHeaderText()).toBe('Top');
  });

  it('switches to frame by elementId', async () => {
    const {
      body: {
        value: { [ELEMENT]: elementId },
      },
    } = await request(app)
      .post(`/session/${sessionId}/element`)
      .send({ using: 'xpath', value: `/html/body/iframe` })
      .expect(200);

    await request(app)
      .post(`/session/${sessionId}/frame`)
      .send({
        id: { [ELEMENT]: elementId },
      })
      .expect(200);

    expect(await getHeaderText()).toBe('FrameA');
  });

  it('throws no such frame error on nonexistent frame', async () => {
    const {
      body: { value },
    } = await request(app)
      .post(`/session/${sessionId}/frame`)
      .send({
        id: 1,
      })
      .expect(404);

    expect(value.error).toBe('no such frame');
  });

  it('switches to parent frame', async () => {
    await request(app)
      .post(`/session/${sessionId}/frame`)
      .send({
        id: 0,
      })
      .expect(200);

    expect(await getHeaderText()).toBe('FrameA');

    await request(app)
      .post(`/session/${sessionId}/frame/parent`)
      .expect(200);

    expect(await getHeaderText()).toBe('Top');
  });

  it('does not throw an error when no parent frame exists', async () => {
    await request(app)
      .post(`/session/${sessionId}/frame/parent`)
      .expect(200);
  });
});
