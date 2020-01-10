const request = require('supertest');
const nock = require('nock');

const { app } = require('../../../build/app');

describe('Session', () => {
  const createSession = async requestBody => {
    const { body } = await request(app)
      .post('/session')
      .send(requestBody);

    return body;
  };

  it('creates a session with alwaysMatch capabilities', async () => {
    const requestBody = {
      capabilities: {
        alwaysMatch: {
          acceptInsecureCerts: false,
          browserName: 'pluma',
          pageLoadStrategy: 'normal',
          unhandledPromptBehavior: 'ignore',
          timeouts: {
            implicit: 100,
            pageLoad: 200,
            script: 300,
          },
          'plm:plumaOptions': { runScripts: true },
        },
      },
    };

    expect(await createSession(requestBody)).toMatchObject({
      value: {
        capabilities: {
          acceptInsecureCerts: true,
          browserName: 'pluma',
          browserVersion: expect.any(String),
          pageLoadStrategy: 'normal',
          platformName: expect.any(String),
          unhandledPromptBehaviour: 'ignore',
          timeouts: {
            implicit: 100,
            pageLoad: 200,
            script: 300,
          },
          proxy: {},
          'plm:plumaOptions': { runScripts: 'dangerously' },
          setWindowRect: expect.any(Boolean),
        },
        sessionId: expect.any(String),
      },
    });
  });

  it('finds matching capabilities', async () => {});
});
