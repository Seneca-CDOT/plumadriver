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

describe('Browser Class', () => {
  describe('Add Cookie', () => {
    let browser;

    beforeEach(async () => {
      browser = await createBrowser();
    });

    it('Adds valid cookie', async () => {
      const cookie = {
        domain: '.example.com',
        expiry: 3654907200,
        httpOnly: false,
        name: 'foo',
        path: '/',
        secure: false,
        value: 'bar',
      };

      await navigateAndAddCookie(browser, 'http://example.com', cookie);
      expect(browser.getCookies()).toEqual(cookie);
    });

    it('Adds a cookie missing optional fields', async () => {
      const cookie = {
        name: 'foo',
        value: 'bar',
      };

      await navigateAndAddCookie(browser, 'http://www.example.com', cookie);
      expect(browser.getCookies()).toEqual(cookie);
    });
  });
});
