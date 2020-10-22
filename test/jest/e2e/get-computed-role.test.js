const request = require('supertest');
const nock = require('nock');

const { default: app } = require('../../../build/app');
const { createSession } = require('../e2e/helpers');
const { ELEMENT } = require('../../../build/constants/constants');

describe('Get Computed Role', () => {
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
          <header id="header" role="foo banner">
           Foo
          </header>
          <a href="www.example.com" role="alert select">  link </a>
          <li role="log alerts">Open file…</li>
          <span> baz </span>
          <p> sample text <p>
          <h1> testing 123 </h1>
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

  const elementRole = async (selector) => {
    const elementId = await getElementId(selector);
    const {
      body: { value },
    } = await request(app).get(
      `/session/${sessionId}/element/${elementId}/computedrole`,
    );
    return value;
  };
  const getElementId = async selector => {
    const {
      body: {
        value: { [ELEMENT]: elementId },
      },
    } = await request(app)
      .post(`/session/${sessionId}/element`)
      .send({ using: 'css selector', value: selector });
    return elementId;
  };

  it('checks role that does exist', async() => {
    expect(await elementRole('li')).toBe('log');
    expect(await elementRole('header')).toBe('banner');
    expect(await elementRole('a')).toBe('alert');
  });

  it('checks role that does not exist', async() => {
    expect(await elementRole('p')).toBe(null);
    expect(await elementRole('h1')).toBe(null);
    expect(await elementRole('span')).toBe(null);
  });
});
