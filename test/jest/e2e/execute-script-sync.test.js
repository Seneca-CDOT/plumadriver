const request = require('supertest');
const nock = require('nock');

const { app } = require('../../../build/app');
const { createSession } = require('./helpers');
const { ELEMENT } = require('../../../build/constants/constants');

describe('Execute Script Sync', () => {
  let sessionId;

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
          <input type="text" value='baz' />
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
            function getInputValue() {
              return document.querySelector('input').value;
            }

            function getParagraphElement() {
              return document.querySelector('p');
            }
          </script>
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

  const executeScript = async (script, args = []) => {
    const {
      body: { value },
    } = await request(app)
      .post(`/session/${sessionId}/execute/sync`)
      .send({ script, args });

    return value;
  };

  it('handles truthy values', async () => {
    expect(await executeScript('return true')).toBe(true);
    expect(await executeScript('return 1')).toBe(1);
    expect(await executeScript('return "false"')).toBe('false');
    expect(await executeScript('return "0"')).toBe('0');
    expect(
      await executeScript('return arguments[0]', [{ foo: 'bar' }]),
    ).toStrictEqual({ foo: 'bar' });
  });

  it('handles falsy values', async () => {
    expect(await executeScript('return false')).toBe(false);
    expect(await executeScript('return NaN')).toBe(NaN);
    expect(await executeScript('return 0')).toBe(0);
    expect(await executeScript('return !!document.all')).toBe(false);
    expect(await executeScript('return Boolean(...arguments[0])', [['']])).toBe(
      false,
    );
  });

  it('handles Promises', async () => {
    expect(
      await executeScript(
        `return new Promise((resolve) => setTimeout(() => resolve(arguments[0] + ' ' + arguments[1]), 400))`,
        ['hello', 'world!'],
      ),
    ).toBe('hello world!');
  });

  it('sums two arguments', async () => {
    expect(
      await executeScript('return arguments[0] + arguments[1];', [1, 2]),
    ).toBe(3);
  });

  it('returns the value of document.title', async () => {
    expect(
      await executeScript('return document[arguments[0]];', ['title']),
    ).toBe('Test Page');
  });

  it('recognizes window and querySelector', async () => {
    expect(
      await executeScript(
        'return window.document.querySelector("#foo").textContent;',
      ),
    ).toBe('bar');
  });

  it('throws a JavaScriptError on an invalid script body', async () => {
    const { error } = await executeScript('return null.foo');
    expect(error).toBe('javascript error');
  });

  it('throws ScriptTimeout when execution takes longer than the set limit', async () => {
    await request(app)
      .post(`/session/${sessionId}/timeouts`)
      .send({
        script: 50,
      });

    const { error } = await executeScript('while (true) {}');
    expect(error).toBe('script timeout');
  });

  it('returns an array of HTMLElements', async () => {
    expect(
      await executeScript(
        'return [document.querySelector("p"), document.querySelector("button")]',
      ),
    ).toStrictEqual([
      { [ELEMENT]: expect.any(String) },
      { [ELEMENT]: expect.any(String) },
    ]);
  });

  it('clicks on a found element', async () => {
    const {
      body: { value },
    } = await request(app)
      .post(`/session/${sessionId}/element`)
      .send({ using: 'css selector', value: 'button' });

    expect(
      await executeScript(
        'arguments[0].click(); return arguments[0].textContent',
        [{ [ELEMENT]: value[ELEMENT] }],
      ),
    ).toBe('click success');
  });

  it('handles global functions', async () => {
    expect(await executeScript('return getInputValue()')).toBe(
      'baz',
    );
    expect(
      await executeScript('return getParagraphElement();'),
    ).toHaveProperty([ELEMENT], expect.any(String));
  });
});
