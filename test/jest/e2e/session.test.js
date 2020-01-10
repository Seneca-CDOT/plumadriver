const request = require('supertest');
const { app } = require('../../../build/app');

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
          'plm:plumaOptions': { runScripts: true },
        },
      },
    };

    expect(await createSession(requestBody)).toMatchObject({
      value: {
        capabilities: {
          acceptInsecureCerts: false,
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

  it('throws invalid session id when accessing a deleted session', async () => {
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
