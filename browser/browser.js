

const jsdom = require('jsdom');
const tough = require('jsdom').toughCookie;

const { JSDOM } = jsdom;
const ELEMENT = 'element-6066-11e4-a52e-4f735466cecf';

const { NoSuchElement } = require('../Error/errors');

class Browser {
  constructor(options) {
    this.dom = new JSDOM();
    this.options = options; // in the future this will be replaced by a default config file
    this.knownElements = [];
  }

  async navigateToURL(URL) {
    if (URL) {
      this.dom = await JSDOM.fromURL(URL);
    }
    return true;
  }

  getTitle() {
    return this.dom.window.document.title;
  }

  getURL() {
    return this.dom.window.document.URL;
  }

  getCookies() {
    const cookies = [];

    this.dom.cookieJar.serialize((err, serializedJar) => {
      if (err) throw err;
      serializedJar.cookies.forEach((cookie) => {
        const currentCookie = {};
        Object.keys(cookie).forEach((key) => {
          if (key === 'key') currentCookie.name = cookie[key];
          else if (key === 'expires') {
            const seconds = new Date(currentCookie[key]).getTime() / 1000;
            currentCookie.expiry = seconds;
          } else currentCookie[key] = cookie[key];
        });
        cookies.push(currentCookie);
      });
    });


    return cookies;
  }

  // TODO: function contains basic functionality, check standard and make compliant
  getKnownElement(id) {
    let foundElement = null;
    this.knownElements.forEach((element) => {
      if (element[ELEMENT] === id) foundElement = element;
    });
    if (!foundElement) throw new NoSuchElement();
    return foundElement;
  }

  close() {
    this.dom.window.close();
  }
}

module.exports = Browser;
