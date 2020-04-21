exports.createSession = async (request, app) => {
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
