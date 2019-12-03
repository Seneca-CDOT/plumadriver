const request = require('supertest');
const nock = require('nock');

const { app } = require('../../../build/app');
const { createSession } = require('./helpers');
const { ELEMENT } = require('../../../build/constants/constants');

describe('Execute Script Sync', () => {
  beforeAll(async () => {
    nock(/plumadriver\.com/)
      .get('/')
      .reply(
        200,
        `<html>
        <head>
          <title>Test Page</title>
        </head>
        <body>
          <p id="foo">bar</p>
          <button onclick="clickAction(this)">
            not clicked
          </button>
          <script>
            function clickAction(e) {
              e.textContent = "click success";
            }
          </script>
          <script>
            function getTextContent() {
              return document.querySelector('title').textContent;
            }

            function getParagraphElement() {
              return document.querySelector('p');
            }
          </script>
        </body>
      </html>`,
      );
  });

  const executeScript = async (sessionId, script, args = []) => {
    const {
      body: { value },
    } = await request(app)
      .post(`/session/${sessionId}/execute/sync`)
      .send({ script, args });

    return value;
  };

  it('handles truthy values', async () => {
    const sessionId = await createSession(request, app);

    expect(await executeScript(sessionId, 'return true')).toBe(true);
    expect(await executeScript(sessionId, 'return 1')).toBe(1);
    expect(await executeScript(sessionId, 'return "false"')).toBe('false');
    expect(await executeScript(sessionId, 'return "0"')).toBe('0');
    expect(
      await executeScript(sessionId, sessionId, 'return arguments', [
        { foo: 'bar' },
      ]),
    ).toEqual([{ foo: 'bar' }]);
  });

  it('handles falsy values', async () => {
    const sessionId = await createSession(request, app);

    expect(await executeScript(sessionId, 'return false')).toBe(false);
    expect(await executeScript(sessionId, 'return NaN')).toBe(NaN);
    expect(await executeScript(sessionId, 'return 0')).toBe(0);
    expect(await executeScript(sessionId, 'return !!document.all')).toBe(false);
    expect(
      await executeScript(sessionId, 'return Boolean(...arguments[0])', [['']]),
    ).toBe(false);
  });

  it('handles Promises', async () => {
    const sessionId = await createSession(request, app);

    expect(
      await executeScript(
        sessionId,
        `return new Promise((resolve) => setTimeout(() => resolve(arguments[0] + ' ' + arguments[1]), 400))`,
        ['hello', 'world!'],
      ),
    ).toBe('hello world!');
  });

  it('sums two arguments', async () => {
    const sessionId = await createSession(request, app);

    expect(
      await executeScript(sessionId, 'return arguments[0] + arguments[1];', [
        1,
        2,
      ]),
    ).toBe(3);
  });

  it('returns the value of document.title', async () => {
    const sessionId = await createSession(request, app);

    expect(
      await executeScript(sessionId, 'return document[arguments[0]];', [
        'title',
      ]),
    ).toBe('Test Page');
  });

  it('recognizes window and querySelector', async () => {
    const sessionId = await createSession(request, app);

    expect(
      await executeScript(
        sessionId,
        'return window.document.querySelector("#foo").textContent;',
      ),
    ).toBe('bar');
  });

  it('throws a JavaScriptError on an invalid script body', async () => {
    const sessionId = await createSession(request, app);
    const { error } = await executeScript(sessionId, 'return null.foo');

    expect(error).toBe('javascript error');
  });

  it('throws ScriptTimeout when execution takes longer than the set limit', async () => {
    const sessionId = await createSession(request, app);

    await request(app)
      .post(`/session/${sessionId}/timeouts`)
      .send({
        script: 50,
      });

    const { error } = await executeScript(sessionId, 'while (true) {}');
    expect(error).toBe('timeout error');
  });

  it('returns an array of HTMLElements', async () => {
    const sessionId = await createSession(request, app);

    expect(
      await executeScript(
        sessionId,
        'return [document.querySelector("p"), document.querySelector("button")]',
      ),
    ).toBe(false);
  });

  it('clicks on a found element', async () => {
    const sessionId = await createSession(request, app);

    const {
      body: { value },
    } = await request(app)
      .post(`/session/${sessionId}/element`)
      .send({ using: 'css selector', value: 'button' });

    expect(
      await executeScript(
        sessionId,
        'arguments[0].click(); return arguments[0].textContent',
        [{ [ELEMENT]: value[ELEMENT] }],
      ),
    ).toBe('click success');
  });

  // it('handles global functions', async () => {
  //   const sessionId = await createSession(request, app);

  //   expect(await executeScript(sessionId, 'return false')).toBe(false);

  //   const textContent = await session.process({
  //     command: COMMANDS.EXECUTE_SCRIPT,
  //     parameters: {
  //       script: 'return getTextContent();',
  //       args: [],
  //     },
  //   });
  //   expect(textContent).toBe('Test Page');

  //   const paragraphElement = await session.process({
  //     command: COMMANDS.EXECUTE_SCRIPT,
  //     parameters: {
  //       script: 'return getParagraphElement();',
  //       args: [],
  //     },
  //   });
  //   expect(paragraphElement).toHaveProperty([ELEMENT], expect.any(String));
  // });
});
