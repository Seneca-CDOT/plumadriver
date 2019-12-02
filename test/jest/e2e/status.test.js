const request = require('supertest');
const { app } = require('../../../build/app');

describe('Status Endpoint', () => {
  it('should respond in the proper format', async () => {
    const response = await request(app).get('/status');
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      value: { message: expect.any(String), ready: expect.any(Boolean) },
    });
  });
});
