const request = require('supertest');
const nock = require('nock');

const { app } = require('../../build/app');
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
          </head>
          <body>
          <div id="invisible" style="visibility: hidden;"></div>
          <div id="collapsed" class="collapsed"></div>
          <div id="no-display" style="display: none;"></div>
          <div id="transparent" style="opacity: 0;"></div>
          <div style="display: none;"><div id="ancestor-none"></div></div>
          <div id="visible"></div>
          <input type="hidden" />
          <input type="text" />
          <select>
            <option value="foo" style="visibility: none;"></option>
          </select>
          <noscript></noscript>
          <img usemap="map" />
          <map name="map" style="visibility: none;"></map>
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

  const elementProperty = async (selector,propertyName) => {
    const elementId = await getElementId(selector);
    const {
      body: { value },
    } = await request(app)
      .get(`/session/${sessionId}/element/${elementId}/property/${propertyName}`)
      .expect(200);

    return value;
  };
  const getElementId = async selector => {
    const {
      body: {
        value: { [ELEMENT]: elementId },
      },
    } = await request(app)
      .post(`/session/${sessionId}/element`)
      .send({ using: 'css selector', value: selector })
      .expect(200);

    return elementId;
  };

  it('checks property that does exist', async()=>
  {
expect(elementProperty('#no-display','style')).toBe("foo")
  })
});