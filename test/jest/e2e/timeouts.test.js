const request = require('supertest');
const { default: app } = require('../../../build/app');
const { createSession } = require('./helpers');

describe('Timeouts', () => {
  it('should respond with proper timeout defaults', async () => {
    const sessionId = await createSession(request, app);
    const { body } = await request(app).get(`/session/${sessionId}/timeouts`);

    expect(body).toStrictEqual({
      value: {
        script: 30000,
        pageLoad: 300000,
        implicit: 0,
      },
    });
  });

  it('should set requested timeouts', async () => {
    const sessionId = await createSession(request, app);
    const requestedTimeouts = {
      script: 0,
      pageLoad: 2000,
      implicit: 3000,
    };

    const timeoutPostResponse = await request(app)
      .post(`/session/${sessionId}/timeouts`)
      .send(requestedTimeouts)
      .expect(200);

    expect(timeoutPostResponse.body).toStrictEqual({
      value: null,
    });

    const {
      body: { value },
    } = await request(app).get(`/session/${sessionId}/timeouts`);

    expect(value).toStrictEqual(requestedTimeouts);
  });

  it('should throw Invalid Argument on invalid timeout property', async () => {
    const sessionId = await createSession(request, app);
    const {
      body: {
        value: { error },
      },
    } = await request(app)
      .post(`/session/${sessionId}/timeouts`)
      .send({
        foo: 2000,
      })
      .expect(400);

    expect(error).toBe('invalid argument');
  });

  it('should throw Invalid Argument on invalid timeout value', async () => {
    const sessionId = await createSession(request, app);
    const {
      body: {
        value: { error },
      },
    } = await request(app)
      .post(`/session/${sessionId}/timeouts`)
      .send({
        script: 1000,
        pageLoad: -2000,
        implicit: 3000,
      })
      .expect(400);

    expect(error).toBe('invalid argument');
  });
});
