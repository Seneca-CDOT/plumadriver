const nock = require('nock');

const { Session } = require('../../build/Session/Session');
const { COMMANDS, ELEMENT } = require('../../build/constants/constants');
const { JavaScriptError, ScriptTimeout } = require('../../build/Error/errors');

describe('Execute Script Sync', () => {
  let session;

  beforeAll(async () => {
    const scope = nock(/plumadriver\.com/)
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

    const requestBody = {
      desiredCapabilities: {
        browserName: 'pluma',
        unhandledPromptBehavior: 'ignore',
        'plm:plumaOptions': { runScripts: true },
      },
      capabilities: {
        firstMatch: [
          {
            browserName: 'pluma',
            'plm:plumaOptions': { runScripts: true },
            unhandledPromptBehavior: 'ignore',
          },
        ],
      },
    };

    session = new Session(requestBody);
    await session.process({
      command: COMMANDS.NAVIGATE_TO,
      parameters: { url: 'http://plumadriver.com' },
    });
  });

  it('returns true', async () => {
    const value = await session.process({
      command: COMMANDS.EXECUTE_SCRIPT,
      parameters: { script: 'return true;', args: [] },
    });
    expect(value).toBe(true);
  });

  it('handles Promises', async () => {
    const value = await session.process({
      command: COMMANDS.EXECUTE_SCRIPT,
      parameters: {
        script: `return new Promise((resolve) => setTimeout(() => resolve(arguments[0] + ' ' + arguments[1]), 400))`,
        args: ['hello', 'world!'],
      },
    });
    expect(value).toBe('hello world!');
  });

  it('sums two arguments', async () => {
    const value = await session.process({
      command: COMMANDS.EXECUTE_SCRIPT,
      parameters: {
        script: 'return arguments[0] + arguments[1];',
        args: [1, 2],
      },
    });
    expect(value).toBe(3);
  });

  it('returns null for undefined values', async () => {
    const value = await session.process({
      command: COMMANDS.EXECUTE_SCRIPT,
      parameters: {
        script: 'return undefined;',
        args: [],
      },
    });
    expect(value).toBe(null);
  });

  it('returns the value of document.title', async () => {
    const value = await session.process({
      command: COMMANDS.EXECUTE_SCRIPT,
      parameters: {
        script: 'return document[arguments[0]];',
        args: ['title'],
      },
    });
    expect(value).toBe('Test Page');
  });

  it('recognizes window and querySelector', async () => {
    const value = await session.process({
      command: COMMANDS.EXECUTE_SCRIPT,
      parameters: {
        script: 'return window.document.querySelector("#foo").textContent;',
        args: [],
      },
    });
    expect(value).toBe('bar');
  });

  it('mutates an object argument', async () => {
    const foo = { bar: 1 };
    await session.process({
      command: COMMANDS.EXECUTE_SCRIPT,
      parameters: {
        script: 'arguments[0].bar = 2; return arguments[0]',
        args: [foo],
      },
    });
    expect(foo.bar).toBe(2);
  });

  it('throws a JavaScriptError on an invalid script body', async () => {
    expect.assertions(1);
    await session
      .process({
        command: COMMANDS.EXECUTE_SCRIPT,
        parameters: {
          script: 'return null.foo',
          args: [],
        },
      })
      .catch(e => expect(e).toBeInstanceOf(JavaScriptError));
  });

  it('throws ScriptTimeout when execution takes longer than the set limit', async () => {
    session.setTimeouts({
      script: 200,
      pageLoad: 7000,
      implicit: 5000,
    });

    expect.assertions(1);
    await session
      .process({
        command: COMMANDS.EXECUTE_SCRIPT,
        parameters: {
          script: 'while (true) {}',
          args: [],
        },
      })
      .catch(e => expect(e).toBeInstanceOf(ScriptTimeout));
  });

  it('returns an array of HTMLElements', async () => {
    const [pElement, buttonElement] = await session.process({
      command: COMMANDS.EXECUTE_SCRIPT,
      parameters: {
        script:
          'return [document.querySelector("p"), document.querySelector("button")]',
        args: [],
      },
    });
    expect(pElement).toHaveProperty([ELEMENT], expect.any(String));
    expect(buttonElement).toHaveProperty([ELEMENT], expect.any(String));
  });

  it('clicks on a found element', async () => {
    const { [ELEMENT]: elementIdentifier } = await session.process({
      command: COMMANDS.FIND_ELEMENT,
      parameters: {
        using: 'css selector',
        value: 'button',
      },
    });

    const buttonText = await session.process({
      command: COMMANDS.EXECUTE_SCRIPT,
      parameters: {
        script: 'arguments[0].click(); return arguments[0].textContent',
        args: [{ [ELEMENT]: elementIdentifier }],
      },
    });
    expect(buttonText).toBe('click success');
  });

  it('handles global functions', async () => {
    const textContent = await session.process({
      command: COMMANDS.EXECUTE_SCRIPT,
      parameters: {
        script: 'return getTextContent();',
        args: [],
      },
    });
    expect(textContent).toBe('Test Page');

    const paragraphElement = await session.process({
      command: COMMANDS.EXECUTE_SCRIPT,
      parameters: {
        script: 'return getParagraphElement();',
        args: [],
      },
    });
    expect(paragraphElement).toHaveProperty([ELEMENT], expect.any(String));
  });
});
