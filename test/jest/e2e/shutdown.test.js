const request = require('supertest');

const { default: app } = require('../../../build/app');
const { createSession } = require('./helpers');
jest.useFakeTimers();

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

  it('exits a PlumaDriver process after 10 seconds', async () => {
    await createSession(request, app);
    let isProcessTerminated = false;


    jest
      .spyOn(process, 'exit')
      .mockImplementation(() => (isProcessTerminated = true));

    expect(setIdleTimeout).toHaveBeenCalled();
    expect(isProcessTerminated).toBe(true);
  })
});
