const request = require('supertest');
const nock = require('nock');

const { default: app } = require('../../build/app');
const { createSession } = require('./e2e/helpers');
const { ELEMENT } = require('../../build/constants/constants');


describe('Checks css values after changing doctype', () => {
  let sessionId;

  beforeAll(async () => {
    nock(/plumadriver\.com/)
      .get('/')
      .reply(
        200,
        `<!DOCTYPE xml>
        <html lang="en">
          <head>
            <title>Test Page</title>
            <style>
            #divtest
            {
              text-align: right;
            }
            h2
            {
              color: red
            }
            p
            {
              text-indent: 50px;
            }
            </style>
          </head>
          <body>
          <div id="divtest" title="baz" ></div>
          <h2> Sample Text </h2>
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

  it('checks property that does exist', async()  => {
    expect(await elementCssValue('#divtest', 'text-align')).toBe('');
    expect(await elementCssValue('h2', 'color')).toBe('');
    expect(await elementCssValue('p', 'text-indent')).toBe('');
   
  });

  
});


