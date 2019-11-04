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

describe('Browser Class', () => {
  describe('Add Cookie', () => {
    let browser;

    beforeEach(async () => {
      browser = await createBrowser();
    });

    it('Adds a valid example.com cookie', async () => {
      const cookie = {
        domain: 'example.com',
        expiry: 3654907200,
        httpOnly: false,
        name: 'foo',
        path: '/',
        secure: false,
        value: 'bar',
      };

      await browser.navigate('http://example.com', 'url');
      browser.addCookie(cookie);
      console.log(browser.getCookies());
    });
  });
});
