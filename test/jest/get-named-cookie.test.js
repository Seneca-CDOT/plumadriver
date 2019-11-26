const nock = require('nock');

const { Session } = require('../../build/Session/Session');
const { COMMANDS } = require('../../build/constants/constants');
const { NoSuchCookie } = require('../../build/Error/errors');

describe('Get Named Cookie', () => {
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

  it('gets an existing cookie by name', async () => {
    await navigateTo('http://plumadriver.com');
    await session.process({
      command: COMMANDS.ADD_COOKIE,
      parameters: {
        cookie: {
          name: 'foo',
          value: 'bar',
          domain: '.plumadriver.com',
        },
      },
    });

    const { name, value } = await session.process({
      command: COMMANDS.GET_NAMED_COOKIE,
      urlVariables: { cookieName: 'foo' },
    });

    expect(name).toBe('foo');
    expect(value).toBe('bar');
  });


  it('respects matching cookie paths', async () => {
    await navigateTo('http://plumadriver.com/a/b');
    await session.process({
      command: COMMANDS.ADD_COOKIE,
      parameters: {
        cookie: {
          name: 'foo',
          value: 'bar',
          domain: '.plumadriver.com',
          path: '/a'
        },
      },
    });

    const { name, value } = await session.process({
      command: COMMANDS.GET_NAMED_COOKIE,
      urlVariables: { cookieName: 'foo' },
    });

    expect(name).toBe('foo');
    expect(value).toBe('bar');
  });

  it('throws NoSuchCookie on mismatched domain', async () => {
    await navigateTo('http://plumadriver.com');
    await session.process({
      command: COMMANDS.ADD_COOKIE,
      parameters: {
        cookie: {
          name: 'foo',
          value: 'bar',
          domain: '.example.com',
        },
      },
    });

    expect.assertions(1);

    await session
      .process({
        command: COMMANDS.GET_NAMED_COOKIE,
        urlVariables: { cookieName: 'foo' },
      })
      .catch(e => {
        expect(e).toBeInstanceOf(NoSuchCookie);
      });
  });

  it('throws NoSuchCookie on mismatched path', async () => {
    await navigateTo('http://plumadriver.com');
    await session.process({
      command: COMMANDS.ADD_COOKIE,
      parameters: {
        cookie: {
          name: 'foo',
          value: 'bar',
          path: '/baz',
        },
      },
    });

    expect.assertions(1);

    await session
      .process({
        command: COMMANDS.GET_NAMED_COOKIE,
        urlVariables: { cookieName: 'foo' },
      })
      .catch(e => {
        expect(e).toBeInstanceOf(NoSuchCookie);
      });
  });
});
