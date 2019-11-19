const nock = require('nock');

const { Session } = require('../../build/Session/Session');
const { COMMANDS, ELEMENT } = require('../../build/constants/constants');
const { JavaScriptError, ScriptTimeout } = require('../../build/Error/errors');

describe('Is Element Enabled', () => {
  let session;

  beforeAll(async () => {
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
  });

  it('returns false on xml document type', async () => {
    nock(/plumadriver\.com/)
      .get('/')
      .reply(
        200,
        `<!DOCTYPE xml>
      <html>
      <head>
        <title>Test Page</title>
      </head>
      <body>
        <button>click</button>
      </body>
      </html>`,
      );

    await session.process({
      command: COMMANDS.NAVIGATE_TO,
      parameters: { url: 'http://plumadriver.com' },
    });

    console.log(session.browser.dom.serialize());

    const { [ELEMENT]: elementId } = await session.process({
      command: COMMANDS.FIND_ELEMENT,
      parameters: {
        using: 'css selector',
        value: 'button',
      },
    });

    const isEnabled = await session.process({
      command: COMMANDS.ELEMENT_ENABLED,
      urlVariables: { elementId },
    });

    expect(isEnabled).toBe(false);
  });

  it('returns true on an h1', async () => {
    nock(/plumadriver\.com/)
      .get('/')
      .reply(
        200,
        `<!DOCTYPE html>
      <html>
      <head>
        <title>Test Page</title>
      </head>
      <body>
        <h1>Hello World</h1>
      </body>
      </html>`,
      );

    await session.process({
      command: COMMANDS.NAVIGATE_TO,
      parameters: { url: 'http://plumadriver.com' },
    });

    console.log(session.browser.dom.serialize());

    const { [ELEMENT]: elementId } = await session.process({
      command: COMMANDS.FIND_ELEMENT,
      parameters: {
        using: 'css selector',
        value: 'h1',
      },
    });

    const isEnabled = await session.process({
      command: COMMANDS.ELEMENT_ENABLED,
      urlVariables: { elementId },
    });

    expect(isEnabled).toBe(true);
  });
});
