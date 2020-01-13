const request = require('supertest');

const { app } = require('../../../build/app');
const { createSession } = require('./helpers');

describe('Shutdown', () => {
  it('exits a PlumaDriver process', async () => {
    await createSession(request, app);
    let isProcessTerminated = false;

    jest
      .spyOn(process, 'exit')
      .mockImplementation(() => (isProcessTerminated = true));

    const {
      body: { value },
    } = await request(app)
      .get(`/shutdown`)
      .expect(200);

    expect(value).toBe(null);
    expect(isProcessTerminated).toBe(true);
  });
});
