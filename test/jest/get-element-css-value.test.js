const request = require('supertest');
const nock = require('nock');

const { app } = require('../../build/app');
const { createSession } = require('./e2e/helpers');
const { ELEMENT } = require('../../build/constants/constants');

describe('Get Element CSS value', () => {
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
  <style>
  #divtest
  {
    color: red
  }
  h1
  {
    font-weight: bold;
  }
  p
  {
    text-align: left;
  }

  </style>
  <div id="divtest" title="baz" ></div>
  <p>
  Testing the css of a paragraph
  </p>
  <h1> Sample Text </h1>
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

  it('checks css properties that exist', async done => {
    expect(await elementCssValue('#divtest', 'color')).toBe('red');
    expect(await elementCssValue('h1', 'font-weight')).toBe('bold');
    expect(await elementCssValue('p', 'text-align')).toBe('left');

    done();
  });
  it('checks css properties that does not exist', async done => {
    expect(await elementCssValue('#divtest', 'foo')).toBe(null);
    expect(await elementCssValue('h1', 'test')).toBe(null);
    expect(await elementCssValue('p', 'baz')).toBe(null);

    done();
  });



  
});
