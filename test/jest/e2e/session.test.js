const request = require('supertest');
const { default: app } = require('../../../build/app');

describe('Session', () => {
  const createSession = async (requestBody, expectedStatusCode = 200) => {
    const { body } = await request(app)
      .post('/session')
      .send(requestBody)
      .expect('Content-Type', /json/)
      .expect(expectedStatusCode);

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
          'plm:plumaOptions': {
            runScripts: true,
            idleTimer: true,
            maxIdleTime: 60
          },
        },
      },
    };

    expect(await createSession(requestBody)).toMatchObject({
      value: {
        capabilities: {
          acceptInsecureCerts: false,
          browserName: 'pluma',
          browserVersion: expect.stringMatching(/^v\d+(\.\d+)*$/),
          pageLoadStrategy: 'normal',
          platformName: expect.any(String),
          unhandledPromptBehavior: 'ignore',
          timeouts: {
            implicit: 100,
            pageLoad: 200,
            script: 300,
          },
          proxy: {},
          'plm:plumaOptions': {
            runScripts: 'dangerously',
            idleTimer: true,
            maxIdleTime: 60
          },
          setWindowRect: expect.any(Boolean),
        },
        sessionId: expect.any(String),
      },
    });
  });

  it('finds matching capabilities', async () => {
    const requestBody = {
      capabilities: {
        alwaysMatch: {
          'plm:plumaOptions': {
            runScripts: true,
          },
        },
        firstMatch: [
          {
            browserName: 'foo',
          },
          {
            timeouts: {
              implicit: 8000,
            },
          },
          {
            timeouts: {
              implicit: 9000,
            },
          },
        ],
      },
    };

    expect(await createSession(requestBody)).toMatchObject({
      value: {
        capabilities: {
          timeouts: {
            implicit: 8000,
          },
        },
      },
    });
  });

  it('throws session not created on no matching capabilities', async () => {
    const {
      value: { error },
    } = await createSession(
      {
        capabilities: {
          alwaysMatch: {
            browserName: 'foo',
          },
        },
      },
      500,
    );

    expect(error).toBe('session not created');
  });

  it.skip('throws invalid session id when accessing a deleted session', async () => {
    const {
      value: { sessionId },
    } = await createSession({
      capabilities: {
        alwaysMatch: {
          'plm:plumaOptions': {
            runScripts: true,
          },
        },
      },
    });

    expect(
      await request(app)
        .delete(`/session/${sessionId}`)
        .expect('Content-Type', /json/)
        .expect(200),
    ).toStrictEqual({ value: null });

    const {
      value: { error },
    } = await request(app)
      .get(`/session/${sessionId}/title`)
      .expect('Content-Type', /json/)
      .expect(404);

    expect(error).toBe('invalid session id');
  });
});
