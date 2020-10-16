const request = require('supertest');
const nock = require('nock');

const { default: app } = require('../../build/app');
const { createSession } = require('./e2e/helpers');
const { ELEMENT } = require('../../build/constants/constants');

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
            <style>
            #divtest
            {
              text-align: center;
            }
            h1
            {
              color: red
            }
            p
            {
              text-indent: 30px;
            }
            </style>
          </head>
          <body>
          <div id="divtest" title="baz" ></div>
          <h1> Sample Text </h1>
          <p> Sample Paragraph text </p>
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

  const elementCssValue = async (selector, propertyName) => {
    const elementId = await getElementId(selector);
    const {
      body: { value },
    } = await request(app).get(
      `/session/${sessionId}/element/${elementId}/css/${propertyName}`,
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

  it('checks property that does exist', async done => {
    expect(await elementCssValue('#divtest', 'text-align')).toBe('center');
    expect(await elementCssValue('h1', 'color')).toBe('red');
    expect(await elementCssValue('p', 'text-indent')).toBe('30px');
    done();
  });
  it('checks property that does exist', async done => {
    expect(await elementCssValue('#divtest', 'foo')).toBe(null);
    expect(await elementCssValue('h1', 'baz')).toBe(null);
    expect(await elementCssValue('p', 'bar')).toBe(null);
    done();
  });

  
});
