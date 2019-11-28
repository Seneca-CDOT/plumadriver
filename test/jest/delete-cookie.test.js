const nock = require('nock');

const { Session } = require('../../build/Session/Session');
const { COMMANDS } = require('../../build/constants/constants');

describe('Delete Cookie', () => {
  let session;

  beforeEach(async () => {
    nock(/plumadriver/)
      .get(/\/\.*/)
      .reply(200, '<html></html>');

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

  const navigateTo = async url => {
    await session.process({
      command: COMMANDS.NAVIGATE_TO,
      parameters: { url },
    });
  };

  const addCookie = async (name, domain, path = '/', value = 'bar') => {
    await session.process({
      command: COMMANDS.ADD_COOKIE,
      parameters: {
        cookie: {
          name,
          domain,
          path,
          value,
        },
      },
    });
  };

  it('deletes an existing cookie by name', async () => {
    await navigateTo('http://plumadriver.com');
    await addCookie('foo', '.plumadriver.com');

    await session.process({
      command: COMMANDS.DELETE_COOKIE,
      urlVariables: { cookieName: 'foo' },
    });

    const cookies = await session.process({
      command: COMMANDS.GET_ALL_COOKIES,
    });

    expect(cookies).toStrictEqual([]);
  });

  it('does not delete an unassociated cookie', async () => {
    await navigateTo('http://plumadriver.com');
    await addCookie('foo', '.pluma.com');

    await session.process({
      command: COMMANDS.DELETE_COOKIE,
      urlVariables: { cookieName: 'foo' },
    });

    const cookies = await session.process({
      command: COMMANDS.GET_ALL_COOKIES,
    });

    expect(cookies).not.toStrictEqual([]);
  });

  it('deletes all associated cookies', async () => {
    await navigateTo('http://plumadriver.com');
    await addCookie('not associated', '.pluma.com', '/');
    await addCookie('also not associated', '.plumadriver.com', '/plumadriver');
    await addCookie('associated', '.plumadriver.com', '/');
    await addCookie('also associated', '.plumadriver.com');

    await session.process({
      command: COMMANDS.DELETE_ALL_COOKIES,
    });

    const cookies = await session.process({
      command: COMMANDS.GET_ALL_COOKIES,
    });

    expect(cookies.map(({ name }) => name)).toStrictEqual([
      'not associated',
      'also not associated',
    ]);
  });

  it('does not throw error on mismatched cookie name', async () => {
    await navigateTo('http://plumadriver.com');
    await addCookie('foo', '.pluma.com', '/');

    await session.process({
      command: COMMANDS.DELETE_COOKIE,
      urlVariables: { cookieName: 'baz' },
    });

    const cookies = await session.process({
      command: COMMANDS.GET_ALL_COOKIES,
    });
  });
});
