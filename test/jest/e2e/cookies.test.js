const request = require('supertest');
const nock = require('nock');

const { app } = require('../../../build/app');
const { createSession } = require('./helpers');

describe('Cookies', () => {
  let sessionId;

  beforeAll(async () => {
    nock(/plumadriver\.com/)
      .get('/')
      .reply(200, '<html></html>');

    sessionId = await createSession(request, app);
  });

  const addCookie = async cookie => {
    const {
      body: { value },
    } = await request(app)
      .post(`/session/${sessionId}/cookie`)
      .send({ cookie })
      .expect(200);

    return value;
  };

  const getNamedCookie = async name => {
    const {
      body: { value },
    } = await request(app)
      .get(`/session/${sessionId}/cookie/${name}`)
      .expect(200);
    console.log('doy', value);
    return value;
  };

  it('adds a valid cookie', async () => {
    await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://plumadriver.com',
      });

    const cookie = {
      secure: false,
      httpOnly: false,
      expiry: 3654907200,
      domain: 'plumadriver.com',
      name: 'valid',
      path: '/',
      value: 'isValid',
    };

    await addCookie(cookie);
    expect(await getNamedCookie(cookie.name)).toMatchObject({
      name: cookie.name,
      value: cookie.value,
    });
  });
});
