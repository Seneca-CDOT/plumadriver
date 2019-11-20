const nock = require('nock');

const { Session } = require('../../build/Session/Session');
const { COMMANDS, ELEMENT } = require('../../build/constants/constants');

describe('Is Element Enabled', () => {
  let session;

  const setScopeAndNavigate = async pageSource => {
    nock(/plumadriver\.com/)
      .get('/')
      .reply(200, pageSource);

    await session.process({
      command: COMMANDS.NAVIGATE_TO,
      parameters: { url: 'http://plumadriver.com' },
    });
  };

  const findElement = async selector => {
    const { [ELEMENT]: elementId } = await session.process({
      command: COMMANDS.FIND_ELEMENT,
      parameters: {
        using: 'css selector',
        value: selector,
      },
    });

    return elementId;
  };

  const checkEnabled = async (selector, expectation) => {
    const elementId = await findElement(selector);
    const { value } = await session.process({
      command: COMMANDS.ELEMENT_ENABLED,
      urlVariables: { elementId },
    });
    expect(value).toBe(expectation);
  };

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
    const pageSource = `<!DOCTYPE xml>
    <html>
    <head>
      <title>Test Page</title>
    </head>
    <body>
      <button>click</button>
    </body>
    </html>`;

    await setScopeAndNavigate(pageSource);
    await checkEnabled('button', false);
  });

  it('returns true on an h1', async () => {
    const pageSource = `<!DOCTYPE html>
    <html>
    <head>
      <title>Test Page</title>
    </head>
    <body>
      <h1>Hello World</h1>
    </body>
    </html>`;

    await setScopeAndNavigate(pageSource);
    await checkEnabled('h1', true);
  });

  it('handles form control elements', async () => {
    const pageSource = `<!DOCTYPE html>
    <html>
    <head>
      <title>Test Page</title>
    </head>
    <body>
      <input type="text" />
      <select></select>
      <button>off</button>
      <textarea>off</textarea>
      <fieldset></fieldset>

      <input type="text" disabled />
      <select disabled></select>
      <button disabled>off</button>
      <textarea disabled>off</textarea>
      <fieldset disabled></fieldset>

    </body>
    </html>`;

    await setScopeAndNavigate(pageSource);
    await checkEnabled('input[disabled]', false);
    await checkEnabled('select[disabled]', false);
    await checkEnabled('button[disabled]', false);
    await checkEnabled('textarea[disabled]', false);
    
    await checkEnabled('input:not([disabled])', true);
    await checkEnabled('select:not([disabled])', true);
    await checkEnabled('button:not([disabled])', true);
    await checkEnabled('textarea:not([disabled])', true);
  });

  it('handles fieldset child elements', async () => {
    const pageSource = `<!DOCTYPE html>
    <html>
    <head>
      <title>Test Page</title>
    </head>
    <body>
      <fieldset disabled>
        <div>
          <button>click</button>
        </div>
      </fieldset>

      <fieldset>
        <legend>foo</legend>
        <select disabled>click</select>
      </fieldset>

      <fieldset disabled>
        <legend>
          <textarea></textarea>
        </legend>
      </fieldset>
    </body>
    </html>`;

    await setScopeAndNavigate(pageSource);
    await checkEnabled('button', false);
    await checkEnabled('select', false);
    await checkEnabled('textarea', true);
  });
});
