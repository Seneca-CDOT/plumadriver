const request = require('supertest');
const nock = require('nock');

const { default: app } = require('../../../build/app');
const { createSession } = require('./helpers');
const { ELEMENT } = require('../../../build/constants/constants');

describe('Click Element', () => {
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
            <label>
              <select>
                <option id="overflow-option" value="foo"></option>
              </select>
            </label>
            <label>
              <textarea id="overflow-textarea"></textarea>
            </label>
            <div id="bar" onclick="">
              <button id="bubble">bubbled=false</button>
            </div>
            <script>
              document
                .querySelector('#bar')
                .addEventListener(
                  'click',
                  e => (e.target.textContent = 'bubbled=true'),
                );
            </script>
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

  const getElement = async cssSelector => {
    const {
      body: {
        value: { [ELEMENT]: elementId },
      },
    } = await request(app)
      .post(`/session/${sessionId}/element`)
      .send({ using: 'css selector', value: cssSelector })
      .expect(200);

    return elementId;
  };

  const clickElement = elementId => {
    return request(app)
      .post(`/session/${sessionId}/element/${elementId}/click`)
      .expect(200);
  };

  it('does not cause call stack error when clicking label descendant', async () => {
    const optionElementId = await getElement('#overflow-option');
    await clickElement(optionElementId);

    const textareaElementId = await getElement('#overflow-textarea');
    await clickElement(textareaElementId);
  });

  it('bubbles click events', async () => {
    const buttonElementId = await getElement('#bubble');
    await clickElement(buttonElementId);

    const {
      body: { value },
    } = await request(app)
      .get(`/session/${sessionId}/element/${buttonElementId}/text`)
      .expect(200);

    expect(value).toBe('bubbled=true');
  });
});
