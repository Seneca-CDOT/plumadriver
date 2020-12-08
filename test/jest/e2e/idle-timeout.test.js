const request = require('supertest');
const waitForExpect = require("wait-for-expect")

const { default: app } = require('../../../build/app');

describe('Idle Timeout', () => {
  jest.setTimeout(20000)
  const createIdleSession = async (seconds) => {
    const requestBody = {
      desiredCapabilities: {
        browserName: 'pluma',
        unhandledPromptBehavior: 'ignore',
        'plm:plumaOptions': {
          runScripts: true,
          idleTimer: true,
          maxIdleTime: seconds
        },
      },
      capabilities: {
        firstMatch: [
          {
            browserName: 'pluma',
            'plm:plumaOptions': {
              runScripts: true,
              idleTimer: true,
              maxIdleTime: seconds
            },
            unhandledPromptBehavior: 'ignore',
          },
        ],
      },
    };
    const {
      body: {
        value: { sessionId },
      },
    } = await request(app)
      .post('/session')
      .send(requestBody)
      .expect(200);

    return sessionId;
  };
  it('exits a PlumaDriver process after 3 seconds', async () => {
    await createIdleSession(3);
    let isProcessTerminated = false;

    jest
      .spyOn(process, 'exit')
      .mockImplementation(() => (isProcessTerminated = true));

    await waitForExpect(() => {
      expect(isProcessTerminated).toBe(true);
    });
  });

  it('check if process exits early before being reinitialized', async () => {
    await createIdleSession(5);
    let isProcessTerminatedEarly = false;

    jest.useFakeTimers();

    jest
      .spyOn(process, 'exit')
      .mockImplementation(() => (isProcessTerminatedEarly = true));

    await createIdleSession(10);

    setTimeout(() => {
      expect(isProcessTerminatedEarly).toBe(false);
    }, 7000)
    jest.runAllTimers();
  });
});
