
const jsdom = require('jsdom');
const tough = require('jsdom').toughCookie;

const { Cookie } = tough;

const { JSDOM } = jsdom;
const ELEMENT = 'element-6066-11e4-a52e-4f735466cecf';

const { InvalidArgument, NoSuchElement } = require('../Error/errors');

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

  addCookie(cookie) {
    const validateCookie = {
      name(name) {
        return (name !== null && name !== undefined);
      },
      value(cookieValue) {
        return this.name(cookieValue);
      },
      domain(passedDomain, currentDomain) {
        return (passedDomain === currentDomain);
      },
      secure(value) {
        return (typeof value === 'boolean');
      },
      httpOnly(httpOnly) {
        return this.secure(httpOnly);
      },
      expiry(expiry) {
        return (Number.isInteger(expiry));
      },
    };

    if (cookie === null || cookie === undefined) throw new InvalidArgument();
    if (!Object.prototype.hasOwnProperty.call(cookie, 'name')
      || !Object.prototype.hasOwnProperty.call(cookie, 'value')
    ) throw new InvalidArgument();

    const scheme = this.getURL().substr(0, this.getURL().indexOf(':'));

    if (scheme !== 'http'
      && scheme !== 'https'
      && scheme !== 'ftp') throw new InvalidArgument();

    Object.keys(validateCookie).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(cookie, key)) {
        if (!validateCookie[key](cookie[key])) throw new InvalidArgument();
      }
    });

    const validCookie = {};

    Object.keys(cookie).forEach((key) => {
      if (key === 'name') validCookie.key = cookie[key];
      else if (key === 'expiry') validCookie.expires = cookie[key];
      else validCookie[key] = cookie[key];
    });

    try {
      this.dom.cookieJar.store.putCookie(new Cookie(validCookie), err => err);
    } catch (err) {
      throw new Error('UNABLE TO SET COOKIE'); // need to create this error class
    }
    return null;
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
