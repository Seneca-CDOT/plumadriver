const request = require('supertest');
const nock = require('nock');

const { default: app } = require('../../../build/app');
const { createSession } = require('./helpers');

describe('Cookies', () => {
  let sessionId;

  beforeEach(async () => {
    nock(/plumadriver/)
      .get(/.*/)
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

  const getNamedCookie = async (name, expectedStatusCode = 200) => {
    const {
      body: { value },
    } = await request(app)
      .get(`/session/${sessionId}/cookie/${name}`)
      .expect(expectedStatusCode);
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
        url: 'http://plumadriver.com/',
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

  it.each([
    { value: 'foo' },
    {
      name: 'foo',
      value: 'bar',
      expiry: -1,
    },
    {
      name: 'foo',
      value: 'bar',
      httpOnly: 'true',
    },
    {
      name: 'foo',
      value: 'bar',
      secure: 'false',
    },
  ])('throws InvalidArgument error on invalid fields', async cookie => {
    await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://plumadriver.com/',
      })
      .expect(200);

    const { error } = await addCookie(cookie, 400);
    expect(error).toBe('invalid argument');
  });

  it('handles .local top-level domains', async () => {
    nock(/foo/)
      .defaultReplyHeaders({
        'Set-Cookie': 'replyCookie=replyValue; Path=/',
      })
      .get('/')
      .reply(200, '<html></html>');

    await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://bar.foo.local',
      })
      .expect(200);

    await addCookie({ name: 'requestCookie', value: 'requestValue' });

    expect(await getNamedCookie('requestCookie')).toMatchObject({
      name: 'requestCookie',
      value: 'requestValue',
      domain: 'bar.foo.local',
    });

    expect(await getNamedCookie('replyCookie')).toMatchObject({
      name: 'replyCookie',
      value: 'replyValue',
      domain: 'bar.foo.local',
    });
  });

  it('respects matching cookie paths', async () => {
    await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://plumadriver.com/a/b',
      })
      .expect(200);

    const requestCookie = {
      name: 'someName',
      value: 'someValue',
      path: '/a',
      domain: '.plumadriver.com',
    };

    await addCookie(requestCookie);

    expect(await getNamedCookie(requestCookie.name)).toMatchObject({
      name: requestCookie.name,
      value: requestCookie.value,
      domain: 'plumadriver.com',
      path: requestCookie.path,
    });
  });

  it('throws NoSuchCookie on mismatched path', async () => {
    await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://plumadriver.com/',
      })
      .expect(200);

    const requestCookie = {
      name: 'noCookie',
      value: 'noValue',
      domain: 'plumadriver.com',
      path: '/baz',
    };

    await addCookie(requestCookie);
    const { error } = await getNamedCookie(requestCookie.name, 404);
    expect(error).toBe('no such cookie');
  });

  it('deletes an existing cookie by name', async () => {
    await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://plumadriver.com/',
      })
      .expect(200);

    const requestCookie = {
      name: 'delete',
      value: 'true',
    };

    await addCookie(requestCookie);

    await request(app)
      .delete(`/session/${sessionId}/cookie/${requestCookie.name}`)
      .expect(200);

    const { error } = await getNamedCookie(requestCookie.name, 404);
    expect(error).toBe('no such cookie');
  });

  it('deletes all associated cookies', async () => {
    await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://plumadriver.com/',
      })
      .expect(200);

    await addCookie({
      name: 'notAssociated',
      value: 'true',
      domain: '.pluma.com',
      path: '/',
    });

    await addCookie({
      name: 'alsoNotAssociated',
      value: 'true',
      domain: '.plumadriver.com',
      path: '/plumadriver',
    });

    await addCookie({
      name: 'associated',
      value: 'true',
      domain: '.plumadriver.com',
      path: '/',
    });

    await addCookie({
      name: 'alsoAssociated',
      value: 'true',
      domain: '.plumadriver.com',
    });

    // delete all cookies
    await request(app)
      .delete(`/session/${sessionId}/cookie`)
      .expect(200);

    // get all cookies
    expect((await getNamedCookie('')).map(({ name }) => name)).toStrictEqual(
      [],
    );
  });

  it('gets all associated cookies', async () => {
    await addCookie({
      name: 'notAssociated',
      value: 'true',
      domain: '.anotherwebsite.com',
      path: '/',
    });

    await request(app)
      .post(`/session/${sessionId}/url`)
      .send({
        url: 'http://plumadriver.com/',
      })
      .expect(200);

    const plumadriverCookie = {
      name: 'associated',
      value: 'true',
      domain: 'plumadriver.com',
      path: '/',
    };

    await addCookie(plumadriverCookie);

    const {
      body: { value: cookies },
    } = await request(app).get(`/session/${sessionId}/cookie`);

    expect(cookies).toStrictEqual([plumadriverCookie]);
  });
});
