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

const testCookieEquality = (firstCookie, secondCookie) => {
  Object.keys(firstCookie).forEach(field => {
    expect(firstCookie[field]).toEqual(secondCookie[field]);
  });
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
      testCookieEquality(...browser.getCookies(), requestCookie);
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
      testCookieEquality(...browser.getCookies(), expectedCookie);
    });

    it('throws InvalidArgument error on invalid domain', async () => {
      const requestCookie = {
        name: 'foo',
        value: 'bar',
        domain: 'google.com',
      };
      expect.assertions(1);
      await navigateAndAddCookie(
        browser,
        'http://example.com',
        requestCookie,
      ).catch(e => expect(e).toBeInstanceOf(InvalidArgument));
    });
  });
});
