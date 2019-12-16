const request = require('supertest');
const nock = require('nock');

const { app } = require('../../../build/app');
const { createSession } = require('./helpers');
const { ELEMENT } = require('../../../build/constants/constants');
const isDisplayedAtom = require('../../../build/utils/isdisplayed-atom.json');

describe('Is Displayed', () => {
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
              * {
                height: 20px;
                width: 20px;
              }
              .collapsed {
                visibility: collapse;
              }
            </style>
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
      });
  });

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

  const isDisplayed = async selector => {
    const elementId = await getElementId(selector);
    const {
      body: { value },
    } = await request(app).get(
      `/session/${sessionId}/element/${elementId}/displayed`,
    );

    return value;
  };

  const seleniumIsDisplayedRequest = async elementId => {
    const {
      body: { value },
    } = await request(app)
      .post(`/session/${sessionId}/execute/sync`)
      .send({ script: isDisplayedAtom, args: [{ [ELEMENT]: elementId }] });

    return value;
  };

  it('returns false on elements that are not displayed', async () => {
    expect(await isDisplayed('#invisible')).toBe(false);
    expect(await isDisplayed('#collapsed')).toBe(false);
    expect(await isDisplayed('#no-display')).toBe(false);
    expect(await isDisplayed('#transparent')).toBe(false);
    expect(await isDisplayed('#ancestor-none')).toBe(false);
    expect(await isDisplayed('input[type="hidden"]')).toBe(false);
    expect(await isDisplayed('noscript')).toBe(false);
  });

  it('returns true on displayed elements', async () => {
    expect(await isDisplayed('#visible')).toBe(true);
    expect(await isDisplayed('map')).toBe(true);
    expect(await isDisplayed('option')).toBe(true);
    expect(await isDisplayed('body')).toBe(true);
    expect(await isDisplayed('select')).toBe(true);
    expect(await isDisplayed('input[type="text"]')).toBe(true);
  });

  it('forwards Selenium request from Execute Script to isDisplayed', async () => {
    const visibleElementId = await getElementId('#visible');
    const invisibleElementId = await getElementId('#invisible');

    expect(await seleniumIsDisplayedRequest(visibleElementId)).toBe(true);
    expect(await seleniumIsDisplayedRequest(invisibleElementId)).toBe(false);
  });
});
