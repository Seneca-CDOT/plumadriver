const request = require('supertest');
const nock = require('nock');

const { app } = require('../../../build/app');
const { createSession } = require('./helpers');

describe('Get Page Source', () => {
  it('returns the serialized DOM', async () => {
    nock(/plumadriver\.com/)
      .get('/')
      .reply(
        200,
        `<body>
          <script>
            document.querySelector('body').appendChild(document.createElement('h1'));
            document.querySelector('h1').textContent = 'test';
          </script>
        </body>`,
      );

    const sessionId = await createSession(request, app);
    await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://plumadriver.com',
      });

    const {
      body: { value },
    } = await request(app).get(`/session/${sessionId}/source`);

    expect(value.replace(/ |\n/g, '')).toBe(
      "<html><head></head><body><script>document.querySelector('body').appendChild(document.createElement('h1'));document.querySelector('h1').textContent='test';</script><h1>test</h1></body></html>",
    );
  });
});
