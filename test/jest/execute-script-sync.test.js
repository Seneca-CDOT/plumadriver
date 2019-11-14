const { Session } = require('../../build/Session/Session');
const { COMMANDS } = require('../../build/constants/constants');

describe('Execute Script Sync', () => {
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
    await session.process({
      command: COMMANDS.NAVIGATE_TO,
      parameters: { url: 'http://example.com' },
    });
  });

  it('returns true', async () => {
    const value = await session.process({
      command: COMMANDS.EXECUTE_SCRIPT,
      parameters: { script: 'return true;', args: [] },
    });
    expect(value).toBe(true);
  });

  it('returns a resolved promise value', async () => {
    const value = await session.process({
      command: COMMANDS.EXECUTE_SCRIPT,
      parameters: { script: 'return Promise.resolve("foo");', args: [] },
    });
    expect(value).toBe('foo');
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
        script: 'return document.title;',
        args: [],
      },
    });
    expect(value).toBe('Example Domain');
  });

  it('mutates an object argument', async () => {
    const foo = {bar: 1};
    await session.process({
      command: COMMANDS.EXECUTE_SCRIPT,
      parameters: {
        script: 'arguments[0].bar = 2; return arguments[0]',
        args: [foo],
      },
    });
    expect(foo.bar).toBe(2);
  });
});
