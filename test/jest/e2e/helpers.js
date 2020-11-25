exports.createSession = async (request, app) => {
  const requestBody = {
    desiredCapabilities: {
      browserName: 'pluma',
      unhandledPromptBehavior: 'ignore',
      'plm:plumaOptions': {
        runScripts: true,
        idleTimer: true,
        maxIdleTime: 4
      },
    },
    capabilities: {
      firstMatch: [
        {
          browserName: 'pluma',
          'plm:plumaOptions': {
            runScripts: true,
            idleTimer: true,
            maxIdleTime: 4
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
