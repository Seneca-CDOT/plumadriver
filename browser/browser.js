
const { jsdom, ResourceLoader } = require('jsdom');
const tough = require('jsdom').toughCookie;

const { Cookie } = tough;

const { JSDOM } = jsdom;
const ELEMENT = 'element-6066-11e4-a52e-4f735466cecf';

const { InvalidArgument, NoSuchElement } = require('../Error/errors');

class Browser {
  constructor(options) {
    this.options = Browser.configureJSDOMOptions(options);
    this.dom = Browser.configureBrowser(this.options);
    this.knownElements = [];
  }

  static configureBrowser(options) {
    const remoteEndPoint = new JSDOM(' ', {
      resources: options.resourceLoader,
      runScripts: options.runScripts,
      beforeParse: options.beforeParse,
    });
  }

  static configureJSDOMOptions(options) {
    // TODO: configure proxy options if provided
    const {
      unhandledPromptBehavior,
      strictSSL,
      runScripts,
    } = options;

    const resourceLoader = new ResourceLoader({
      strictSSL: true,
    });

    resourceLoader.strictSSL = strictSSL ? strictSSL : true;

    const JSDOMOptions = {
      resources: resourceLoader,
      includeNodeLocations: true,
      contentType: 'text/html',
    };

    JSDOMOptions.runScripts = runScripts ? 'dangerously' : '';

    let beforeParse;
    if (unhandledPromptBehavior && runScripts) {
      switch (unhandledPromptBehavior) {
        case 'accept':
          beforeParse = (window) => {
            window.confirm = () => true;
            window.alert = () => true;
            window.prompt = () => true;
          };
          break;
        case 'dismiss':
          beforeParse = (window) => {
            window.confirm = () => false;
            window.alert = () => false;
            window.prompt = () => false;
          };
          break;
        case 'dismiss and notify':
          beforeParse = (window) => {
            window.confirm = (message) => { console.log(message); return false; };
            window.alert = (message) => { console.log(message); return false; };
            window.prompt = (message) => { console.log(message); return false; };
          };
          break;
        case 'accept and notify':
          beforeParse = (window) => {
            window.confirm = (message) => { console.log(message); return true; };
            window.alert = (message) => { console.log(message); return true; };
            window.prompt = (message) => { console.log(message); return true; };
          };
          break;
        case 'ignore':
          break;
        default:
          break;
      }
    }

    JSDOMOptions.beforeParse = beforeParse;

    return JSDOMOptions;
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
