exports.createSession = async (request, app) => {
  const requestBody = {
    desiredCapabilities: {
      browserName: 'pluma',
      unhandledPromptBehavior: 'ignore',
      'plm:plumaOptions': {
        runScripts: true,
        idleTimer: false
      },
    },
    capabilities: {
      firstMatch: [
        {
          browserName: 'pluma',
          'plm:plumaOptions': {
            runScripts: true,
            idleTimer: false
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
