const request = require('supertest');
const nock = require('nock');

const { app } = require('../../../build/app');
const { createSession } = require('./helpers');

describe('Cookies', () => {
  let sessionId;

  beforeAll(async () => {
    nock(/plumadriver/)
      .get('/')
      .reply(200, '<html></html>');

    sessionId = await createSession(request, app);
  });

  const addCookie = async (cookie, expectedStatusCode = 200) => {
    const {
      body: { value },
    } = await request(app)
      .post(`/session/${sessionId}/cookie`)
      .send({ cookie })
      .expect(expectedStatusCode);

    return value;
  };

  const getNamedCookie = async name => {
    const {
      body: { value },
    } = await request(app)
      .get(`/session/${sessionId}/cookie/${name}`)
      .expect(200);

    console.log(value);
    return value;
  };

  it('adds a valid cookie', async () => {
    await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://plumadriver.com',
      });

    const requestCookie = {
      secure: false,
      httpOnly: false,
      expiry: 3654907200,
      domain: 'plumadriver.com',
      name: 'valid',
      path: '/',
      value: 'isValid',
    };

    await addCookie(requestCookie);
    expect(await getNamedCookie(requestCookie.name)).toMatchObject({
      name: requestCookie.name,
      value: requestCookie.value,
      domain: requestCookie.domain,
      path: requestCookie.path,
    });
  });

  it('handles dot prefix in cookie domains', async () => {
    await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://plumadriver.com/',
      });

    const requestCookie = {
      secure: true,
      httpOnly: true,
      expiry: 1573253325754,
      domain: '.plumadriver.com',
      name: 'foo',
      path: '/',
      value: 'bar',
    };

    await addCookie(requestCookie);
    expect(await getNamedCookie(requestCookie.name)).toMatchObject({
      name: requestCookie.name,
      value: requestCookie.value,
      domain: 'plumadriver.com',
    });
  });

  it('adds a cookie filling in missing optional fields', async () => {
    await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://www.plumadriver.com/',
      });

    const requestCookie = {
      name: 'foo',
      value: 'bar',
    };

    await addCookie(requestCookie);
    expect(await getNamedCookie(requestCookie.name)).toMatchObject({
      name: requestCookie.name,
      value: requestCookie.value,
      domain: 'plumadriver.com',
      path: '/',
    });
  });

  it('throws InvalidArgument error on invalid fields', async () => {
    await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://plumadriver.com/',
      });

    await addCookie({ value: 'foo' });

    await addCookie({
      name: 'foo',
      value: 'bar',
      expiry: -1,
    }, 400);

    await addCookie(
      addCookieAndAssertError(browser, {
        name: 'foo',
        value: 'bar',
        httpOnly: 'true',
      }, 400),
    );

    await addCookie({
      name: 'foo',
      value: 'bar',
      secure: 'false',
    }, 400);
  });
});
