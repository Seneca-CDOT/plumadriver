const nock = require('nock');


const { Session } = require('../../build/Session/Session');
const { COMMANDS, ELEMENT } = require('../../build/constants/constants');

describe('Is Element Selected', () => {
  let session;

  const setScopeAndNavigate = async pageSource => {
    nock(/plumadriver\.com/)
      .get('/')
      .reply(200, pageSource);

    await session.process({
      command: COMMANDS.NAVIGATE_TO,
      parameters: { url: 'http://plumadriver.com' },
    });
  }

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

  const checkSelected = async (selector, expectation) => {
    const elementId = await findElement(selector);
    const { value } = await session.process({
      command: COMMANDS.ELEMENT_SELECTED,
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

  it('returns checkbox\'s checkedness', async () => {
    const pageSource = `<!DOCTYPE html>
    <html>
    <head>
      <title>Test Page</title>
    </head>
    <body>
      <input type='checkbox' value='foo' checked>
      <input type='checkbox' value='bar'>
    </body>
    </html>`;

    await setScopeAndNavigate(pageSource);
    await checkSelected('input:checked', true);
    await checkSelected('input:not(:checked)', false);
  });

  it('returns radio button\'s checkedness', async () => {
    const pageSource = `<!DOCTYPE html>
    <html>
    <head>
      <title>Test Page</title>
    </head>
    <body>
      <input type='radio' name='test' value='foo' checked>
      <input type='radio' name='test' value='bar'>
    </body>
    </html>`;

    await setScopeAndNavigate(pageSource);
    await checkSelected('input:checked', true);
    await checkSelected('input:not(:checked)', false);
  });

  it('returns option\'s selectedness', async () => {
    const pageSource = `<!DOCTYPE html>
    <html>
    <head>
      <title>Test Page</title>
    </head>
    <body>
      <select>
        <option value='foo' selected>foo<option>
        <option value='bar'>bar<option>
      </select>
    </body>
    </html>`;

    await setScopeAndNavigate(pageSource);
    await checkSelected('option:checked', true);
    await checkSelected('option:not(:checked)', false);
  });

  it('returns false for other elements', async () => {
    const pageSource = `<!DOCTYPE html>
    <html>
    <head>
      <title>Test Page</title>
    </head>
    <body>
      <input type='text' value='foo'>
      <h1>bar</h1>
    </body>
    </html>`;

    await setScopeAndNavigate(pageSource);
    await checkSelected('input', false);
    await checkSelected('h1', false);
  });
});
