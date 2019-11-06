const { Browser } = require('../../../build/Browser/Browser');
const { JSDOM } = require('jsdom');

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
  console.log(browser.getCookies());
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
  });
});
