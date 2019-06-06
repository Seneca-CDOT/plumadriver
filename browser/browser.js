const { JSDOM, ResourceLoader } = require('jsdom');
const tough = require('jsdom').toughCookie;

const { Cookie } = tough;

// identifies a web element
const ELEMENT = 'element-6066-11e4-a52e-4f735466cecf';

const { InvalidArgument, NoSuchElement } = require('../Error/errors');

class Browser {
  constructor(capabilties) {
    this.options = Browser.configureJSDOMOptions(capabilties);
    this.configureBrowser(this.options);
    this.knownElements = [];
  }

  // creates JSDOM object from provided options and (optional) url
  async configureBrowser(options, url = null, pathType = 'url') {
    let dom;

    if (url !== null) {
      await JSDOM.fromURL(url, {
        resources: options.resourceLoader,
        runScripts: options.runScripts,
        beforeParse: options.beforeParse,
      })
        .then(
          dom => new Promise((resolve) => {
            dom.window.addEventListener('load', () => {
              /*  promise resolves once the load event has fired allowing window.onload
              events to execute before the DOM object can be manipulated  */
              resolve(dom);
            });
          }),
        )
        .then((dom) => {
          this.dom = dom;
        });
    } else {
      this.dom = await new JSDOM(' ', {
        resources: options.resources,
        runScripts: options.runScripts,
        beforeParse: options.beforeParse,
      });
    }

    // webdriver-active property (W3C)
    this.dom.window.navigator.webdriver = true;
    this.activeElement = this.dom.window.document.activeElement;
  }

  static configureJSDOMOptions(capabilities) {
    // TODO: configure proxy options if provided

    const options = {
      runScripts: capabilities.runScripts ? 'dangerously' : null,
      unhandledPromptBehavior: capabilities.unhandledPromptBehavior
        ? capabilities.unhandledPromptBehavior
        : 'dismiss and notify',
      strictSSL:
        capabilities.strictSSL === false ? capabilities.strictSSL : true,
    };
    const resourceLoader = new ResourceLoader({
      strictSSL: options.strictSSL,
      proxy: '',
    });

    const JSDOMOptions = {
      resources: resourceLoader,
      includeNodeLocations: true,
      contentType: 'text/html',
    };

    if (options.runScripts !== null) JSDOMOptions.runScripts = options.runScripts;

    function beforeParseFactory(callback) {
      return (window) => {
        window.confirm = callback;
        window.alert = callback;
        window.prompt = callback;
      };
    }

    let beforeParse;
    if (options.unhandledPromptBehavior && options.runScripts) {
      switch (options.unhandledPromptBehavior) {
        case 'accept':
          beforeParse = beforeParseFactory(() => true);
          break;
        case 'dismiss':
          beforeParse = beforeParseFactory(() => false);
          break;
        case 'dismiss and notify':
          beforeParse = beforeParseFactory((message) => {
            console.log(message);
            return false;
          });
          break;
        case 'accept and notify':
          beforeParse = beforeParseFactory((message) => {
            console.log(message);
            return true;
          });
          break;
        case 'ignore':
          break;
        default:
          break;
      }
    }
    if (beforeParse) JSDOMOptions.beforeParse = beforeParse;
    return JSDOMOptions;
  }

  async navigateToURL(URL, pathType) {
    if (URL) {
      await this.configureBrowser(this.options, URL, pathType);
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
    const { URL } = this.dom.window;
    // object validates cookie properties
    const validateCookie = {
      name(name) {
        return name !== null && name !== undefined;
      },
      value(cookieValue) {
        return this.name(cookieValue);
      },
      domain(cookieDomain, currentURL) {
        // strip current URL of path and protocol
        let currentDomain = new URL(currentURL).hostname;

        // strip currentDomain of subdomains
        const www = /^www\./;

        // remove leading www
        if (currentDomain.search(www) > -1) currentDomain = currentDomain.replace(www, '');

        if (currentDomain === cookieDomain) return true; // replace with success

        if (cookieDomain.indexOf('.') === 0) { // begins with '.'
          let cookieDomainRegEx = cookieDomain.substring(1).replace(/\./, '\\.');
          cookieDomainRegEx = new RegExp(`${cookieDomainRegEx}$`);

          if (currentDomain.search(cookieDomainRegEx) > -1) return true;

          const cleanCookieDomain = cookieDomain.substring(1);
          if (cleanCookieDomain === currentDomain) return true;

          return false;
        }
        return false;
      },
      secure(value) {
        return typeof value === 'boolean';
      },
      httpOnly(httpOnly) {
        return this.secure(httpOnly);
      },
      expiry(expiry) {
        return Number.isInteger(expiry);
      },
    };

    // check for null or undefined
    if (cookie === null || cookie === undefined) throw new InvalidArgument();

    // assert cookie has name and value properties
    if (
      !Object.prototype.hasOwnProperty.call(cookie, 'name')
      || !Object.prototype.hasOwnProperty.call(cookie, 'value')
    ) throw new InvalidArgument();

    // get the url scheme, determine if it is not a network scheme
    const scheme = this.getURL().substr(0, this.getURL().indexOf(':'));

    // validate extracted scheme
    if (scheme !== 'http' && scheme !== 'https' && scheme !== 'ftp') throw new InvalidArgument();

    // validates cookie
    Object.keys(validateCookie).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(cookie, key)) {
        if (key === 'domain') {
          if (!validateCookie[key](cookie[key], this.getURL())) {
            throw new InvalidArgument();
          }
        } else if (!validateCookie[key](cookie[key])) {
          throw new InvalidArgument();
        }
      }
    });

    const validCookie = {};

    // stores validated cookie properties in validCookie
    Object.keys(cookie).forEach((key) => {
      if (key === 'name') validCookie.key = cookie[key];
      else if (key === 'expiry') validCookie.expires = cookie[key];
      else validCookie[key] = cookie[key];
    });

    // create tough cookie and store in jsdom cookie jar
    try {
      this.dom.cookieJar.store.putCookie(new Cookie(validCookie), err => err);
    } catch (err) {
      throw new Error('UNABLE TO SET COOKIE'); // need to create this error class
    }
    return null;
  }

  // returns the cookies inside the jsdom object
  getCookies() {
    const cookies = [];

    this.dom.cookieJar.serialize((err, serializedJar) => {
      if (err) throw err;
      serializedJar.cookies.forEach((cookie) => {
        const currentCookie = {};
        Object.keys(cookie).forEach((key) => {
          // renames 'key' property to 'name' for W3C compliance and selenium functionality
          if (key === 'key') currentCookie.name = cookie[key];
          else if (key === 'expires') {
            // sets the expiry time in seconds form epoch time
            // renames property for selenium functionality
            const seconds = new Date(currentCookie[key]).getTime() / 1000;
            currentCookie.expiry = seconds;
          } else currentCookie[key] = cookie[key];
        });
        cookies.push(currentCookie);
      });
    });

    return cookies;
  }

  // finds a known element in the known element list, throws no such error if element not found
  getKnownElement(id) {
    let foundElement = null;
    this.knownElements.forEach((element) => {
      if (element[ELEMENT] === id) foundElement = element;
    });
    if (!foundElement) throw new NoSuchElement();
    return foundElement;
  }

  // calls the jsdom close method terminating all timers created within jsdom scripts
  close() {
    this.dom.window.close();
  }
}

module.exports = Browser;
