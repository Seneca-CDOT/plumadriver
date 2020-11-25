const request = require('supertest');
const waitForExpect = require("wait-for-expect")

const { default: app } = require('../../../build/app');
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

  it('exits a PlumaDriver process after 10 seconds', async () => {
    await createSession(request, app);
    let isProcessTerminated = false;
    let calls = 0;

    jest.useFakeTimers();
    const createFn = jest.fn();
    createFn.mockImplementation(() =>{
      calls++;
      createSession(request, app);
    });

    jest
    .spyOn(process, 'exit')
    .mockImplementation(() => (isProcessTerminated = true));

    setInterval(()=>{
      if(calls !== 2) {
        createFn();
      }
    }, 3000)

    jest.advanceTimersByTime(6000);

    expect(createFn).toHaveBeenCalledTimes(2);

    await waitForExpect(()=> {
      expect(isProcessTerminated).toBe(true);
    });
  });
});
