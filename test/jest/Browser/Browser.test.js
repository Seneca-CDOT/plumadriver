const { Browser } = require('../../../build/Browser/Browser');
const { InvalidArgument } = require('../../../build/Error/errors');

const nock = require('nock');

const createBrowser = () => {
  const browserOptions = {
    runScripts: false,
    strictSSL: false,
    unhandledPromptBehaviour: 'dismiss and notify',
    rejectPublicSuffixes: false,
  };
  return new Browser(browserOptions);
};

const navigateAndAddCookie = async (browser, url, cookie) => {
  await browser.navigate(url, 'url');
  browser.addCookie(cookie);
};

const assertCookieEquality = (firstCookie, secondCookie) => {
  Object.keys(firstCookie).forEach(field => {
    expect(firstCookie[field]).toEqual(secondCookie[field]);
  });
};

const addCookieAndAssertError = (browser, cookie) => {
  try {
    browser.addCookie(cookie);
  } catch (e) {
    expect(e).toBeInstanceOf(InvalidArgument);
  }
};

describe('Browser Class', () => {
  describe('AddCookie', () => {
    let browser;

    beforeEach(async () => {
      browser = await createBrowser();
      const scope = nock(/plumadriver\.com/)
        .get('/')
        .reply(200, '<html></html>');
    });

    it('adds a valid cookie', async () => {
      const requestCookie = {
        secure: false,
        httpOnly: false,
        expiry: 3654907200,
        domain: 'plumadriver.com',
        name: 'foo',
        path: '/',
        value: 'bar',
      };

      await navigateAndAddCookie(browser, 'http://plumadriver.com', requestCookie);
      assertCookieEquality(...browser.getCookies(), requestCookie);
    });

    it('handles dot prefix in cookie domains', async () => {
      const requestCookie = {
        secure: true,
        httpOnly: true,
        expiry: 1573253325754,
        domain: '.plumadriver.com',
        name: 'foo',
        path: '/portal',
        value: 'bar',
      };

      await navigateAndAddCookie(browser, 'http://plumadriver.com', requestCookie);
      assertCookieEquality(...browser.getCookies(), {
        ...requestCookie,
        domain: 'plumadriver.com',
      });
    });

    it('adds a cookie filling in missing optional fields', async () => {
      const requestCookie = {
        name: 'foo',
        value: 'bar',
      };

      const expectedCookie = {
        ...requestCookie,
        path: '/',
        domain: 'www.plumadriver.com',
      };

      await navigateAndAddCookie(
        browser,
        'http://www.plumadriver.com',
        requestCookie,
      );
      assertCookieEquality(expectedCookie, ...browser.getCookies());
    });

    it('throws InvalidArgument error on invalid fields', async () => {
      await browser.navigate('http://plumadriver.com', 'url');
      expect.assertions(4);
      addCookieAndAssertError(browser, {
        value: 'foo',
      });
      addCookieAndAssertError(browser, {
        name: 'foo',
        value: 'bar',
        expiry: -1,
      });
      addCookieAndAssertError(browser, {
        name: 'foo',
        value: 'bar',
        httpOnly: 'true',
      });
      addCookieAndAssertError(browser, {
        name: 'foo',
        value: 'bar',
        secure: 'false',
      });
    });
  });
});
