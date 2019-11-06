const { Browser } = require('../../../build/Browser/Browser');
const { InvalidArgument } = require('../../../build/Error/errors');

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
  describe('Add Cookie', () => {
    let browser;

    beforeEach(async () => {
      browser = await createBrowser();
    });

    it('adds valid cookie', async () => {
      const requestCookie = {
        secure: false,
        httpOnly: false,
        expiry: 3654907200,
        domain: '.example.com',
        name: 'foo',
        path: '/',
        value: 'bar',
      };

      await navigateAndAddCookie(browser, 'http://example.com', requestCookie);
      assertCookieEquality(...browser.getCookies(), requestCookie);
    });

    it('adds a cookie with missing optional fields', async () => {
      const requestCookie = {
        name: 'foo',
        value: 'bar',
      };

      const expectedCookie = {
        ...requestCookie,
        path: '/',
        domain: 'example.com',
      };

      await navigateAndAddCookie(browser, 'http://example.com', requestCookie);
      assertCookieEquality(expectedCookie, ...browser.getCookies());
    });

    it('throws InvalidArgument error on invalid fields', async () => {
      await browser.navigate('http://example.com', 'url');
      expect.assertions(5);
      addCookieAndAssertError(browser, {
        name: 'foo',
        value: 'bar',
        domain: 'google.com',
      });
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
