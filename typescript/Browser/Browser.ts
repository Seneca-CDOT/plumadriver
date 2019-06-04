import { toughCookie, JSDOM, ResourceLoader } from 'jsdom';
import { BrowserConfig } from './BrowserConfig';
import { BrowserOptions } from '../Types/types';
import { ELEMENT } from '../constants/constants';
import { WebElement } from '../WebElement/WebElement';
import  * as Utils  from '../utils/utils';

const { Cookie } = toughCookie;

// TODO: include Error classes after migratring to typescript


/**
 * Plumadriver browser with jsdom at its core.
 * @param {BrowserConfig} browserConfig contains the user-defined jsdom configuration for the session
 * @param {Array<WebElement>} knownElements the list of known elements https://www.w3.org/TR/webdriver1/#elements
 * @param {JSDOM} dom jsdom object
 * @param {HTMLElement} activeElement the browser's active element 
 */
export class Browser {
  browserConfig: BrowserConfig;
  knownElements: Array<WebElement>;
  dom:JSDOM;
  activeElement:HTMLElement | null;

  constructor(capabilities: object) {
    
    let browserOptions: BrowserOptions = {
      runScripts: '',
      strictSSL: true,
      unhandledPromptBehaviour: 'dismiss and notify',
    };

    Object.keys(browserOptions).forEach((option) => {
      if (capabilities[option]) browserOptions[option] = capabilities[option];
    });

    this.browserConfig = new BrowserConfig(browserOptions);
  }

  /**
   * Creates an empty jsdom object or from a url depending on if the url parameter was passed
   * @param config @type {BrowserConfig} the jsdom configuration for the session 
   * @param url @type {URL} an optional url 
   */
  async configureBrowser(config:BrowserConfig, url:URL) {
    let dom;

    if (url !== null) {
      dom = await JSDOM.fromURL(url, {
        resources: config.resourceLoader,
        runScripts: config.runScripts,
        beforeParse: config.beforeParse,
      });

      /*  promise resolves after load event has fired. Allows onload events to execute
      before the DOM object can be manipulated  */
      const loadEvent = () => new Promise((resolve) => {
        dom.window.addEventListener('load', () => {
          resolve(dom);
        });
      });

      this.dom = await loadEvent();
    } else {
      this.dom = await new JSDOM(' ', {
        resources: config.resourceLoader,
        runScripts: config.runScripts,
        beforeParse: config.beforeParse,
      });
    }

    // webdriver-active property (W3C)
    this.dom.window.navigator.webdriver = true;
    this.activeElement = this.dom.window.document.activeElement;
  }

  async navigateToURL(url:URL) {
    if (url) {
      await this.configureBrowser(this.browserConfig, url);
    }
  }

  /**
   * Returns the current page title
   */
  get title() {return this.dom.window.document.title;}

/**
 * returns the current page url
 */
  get url() {return this.dom.window.document.URL;}

  /**
   * sets a cookie on the browser
   */
  set cookie(cookie) {
    
    if (Utils.isCookie(cookie)) {
      const scheme = this.url().substr(0, this.url().indexOf(':'));
      if (scheme !== 'http' && scheme !== 'https' && scheme !== 'ftp') throw new InvalidArgument();

      // validates cookie
      Object.keys(Utils.validateCookie).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(cookie, key)) {
          if (key === 'domain') {
            if (!Utils.validateCookie[key](cookie[key], this.url())) {
              throw new InvalidArgument();
            }
          } else if (!Utils.validateCookie[key](cookie[key])) {
            throw new InvalidArgument();
          }
        }
      });

    } else {
      throw new InvalidArgument();
    }

    //------------------------------------------------------------------------------------------

    const validCookie:any = {};

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
  }

  /**
   * returns all cookies in the cookie jar
   */
  get cookies() {
    const cookies = [];

    this.dom.cookieJar.serialize((err, serializedJar) => {
      if (err) throw err;
      serializedJar.cookies.forEach((cookie) => {
        const currentCookie:any = {};
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

  /**
   * 
   * @param elementId @type {string} the id of a known element in the known element list
   */
  getKnownElement(elementId:string):WebElement {
    let foundElement = null;
    this.knownElements.forEach((element) => {
      if (element[ELEMENT] === elementId) foundElement = element;
    });
    if (!foundElement) throw new NoSuchElement();
    return foundElement;
  }

  /**
   * terminates all scripts and timers initiated in jsdom vm
   */
  close() {
    this.dom.window.close();
  }
}
