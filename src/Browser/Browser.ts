import { JSDOM } from 'jsdom';
import { BrowserConfig } from './BrowserConfig';
import { Pluma } from '../Types/types';
import { ELEMENT } from '../constants/constants';
import { WebElement } from '../WebElement/WebElement';
import * as Utils from '../utils/utils';
import * as PlumaError from '../Error/errors';
import { CookieValidator } from './CookieValidator';

import { Cookie } from '../jsdom_extensions/tough-cookie/lib/cookie';

/**
 * Plumadriver browser with jsdom at its core.
 * Stores user-defined config object from which to create new instances of jsdom upon
 * navigation to any given URL.
 */
class Browser {
  /** contains the user-defined jsdom configuration object for the session */
  browserConfig: BrowserConfig;

  /** the [list of known elements](https://www.w3.org/TR/webdriver1/#elements) */
  knownElements: Array<WebElement> = [];

  /** the jsdom object */
  dom: JSDOM;

  /** the Window of the current browsing context */
  private currentBrowsingContextWindow: Window;

  /** accepts a capabilities object with jsdom and plumadriver specific options */
  constructor(capabilities: object) {
    const browserOptions: Pluma.BrowserOptions = {
      runScripts: '',
      strictSSL: true,
      unhandledPromptBehaviour: 'dismiss and notify',
      rejectPublicSuffixes: false,
    };

    Object.keys(browserOptions).forEach(option => {
      if (capabilities[option]) browserOptions[option] = capabilities[option];
    });

    this.browserConfig = new BrowserConfig(browserOptions);
    this.configureBrowser(this.browserConfig, null);
  }

  /**
   * Creates an empty jsdom object from a url or file path depending on the url pathType parameter value.
   * Accepts a [[BrowserConfig]] object used to configure the jsdom object
   */
  async configureBrowser(
    config: BrowserConfig,
    url: URL | null,
    pathType = 'url',
  ) {
    let dom;

    if (url !== null) {
      if (pathType === 'url') {
        dom = await JSDOM.fromURL(url, {
          resources: config.resourceLoader,
          runScripts: config.runScripts,
          beforeParse: config.beforeParse,
          pretendToBeVisual: true,
          cookieJar: config.jar,
        });
      } else if (pathType === 'file') {
        dom = await JSDOM.fromFile(url, {
          resources: config.resourceLoader,
          runScripts: config.runScripts,
          beforeParse: config.beforeParse,
          pretendToBeVisual: true,
          cookieJar: config.jar,
        });
      }

      /*  promise resolves after load event has fired. Allows onload events to execute
      before the DOM object can be manipulated  */
      const loadEvent = () =>
        new Promise(resolve => {
          dom.window.addEventListener('load', () => {
            resolve(dom);
          });
        });

      this.dom = await loadEvent();
    } else {
      this.dom = new JSDOM(' ', {
        resources: config.resourceLoader,
        runScripts: config.runScripts,
        beforeParse: config.beforeParse,
        pretendToBeVisual: true,
        cookieJar: config.jar,
      });
    }

    const { window } = this.dom;

    // webdriver-active property (W3C)
    window.navigator.webdriver = true;

    this.setCurrentBrowsingContextWindow(window);
  }

  /**
   * handles errors thrown by the navigation function
   */
  private handleNavigationError(error, config) {
    // the jsdom instance will otherwise crash on a 401
    if (error.statusCode === 401) {
      this.dom = new JSDOM(' ', {
        resources: config.resourceLoader,
        runScripts: config.runScripts,
        beforeParse: config.beforeParse,
        pretendToBeVisual: true,
        cookieJar: config.jar,
      });
    } else {
      throw error;
    }
  }

  /**
   * accepts a url and pathType @type {String} from which to instantiate the
   * jsdom object
   */
  async navigate(path: URL, pathType) {
    if (path) {
      try {
        await this.configureBrowser(this.browserConfig, path, pathType);
      } catch (error) {
        this.handleNavigationError(error, this.browserConfig);
      }
    }
    return true;
  }

  /**
   * Get the current page title.
   * @returns {String}
   */
  public getTitle(): string {
    return this.currentBrowsingContextWindow.document.title;
  }

  /**
   * Get the current page url.
   * @returns {String}
   */
  public getUrl(): string {
    return this.currentBrowsingContextWindow.document.URL;
  }

  /**
   * Get the Window object associated with the current browsing context.
   * @returns {Window}
   */
  public getCurrentBrowsingContextWindow(): Window {
    return this.currentBrowsingContextWindow;
  }

  /**
   * Set the Window for the current browsing context.
   * @param {Window} window - the Window object
   */
  public setCurrentBrowsingContextWindow(window: Window) {
    this.currentBrowsingContextWindow = window;
  }

  /**
   * Get the currently focused element.
   * @returns {HTMLElement}
   */
  public getActiveElement(): HTMLElement {
    return this.currentBrowsingContextWindow.document
      .activeElement as HTMLElement;
  }

  private createCookieJarOptions(
    cookie: Pluma.Cookie,
    activeDomain: string,
  ): Pluma.Cookie {
    const OPTIONAL_FIELD_DEFAULTS = {
      domain: activeDomain,
      path: '/',
      secure: false,
      httpOnly: false,
    };
    // fill in any missing fields with W3C defaults
    // https://www.w3.org/TR/webdriver/#dfn-table-for-cookie-conversion
    return { ...OPTIONAL_FIELD_DEFAULTS, ...cookie };
  }

  /**
   * clones a cookie removing the dot prefix in the domain field
   */
  private cloneCookieWithoutDomainDotPrefix(
    cookie: Pluma.Cookie,
  ): Pluma.Cookie {
    return {
      ...cookie,
      domain: cookie.domain.replace(/^\./, ''),
    };
  }

  /*
   * returns true if the cookie domain is prefixed with a dot
   */
  private isCookieDomainDotPrefixed(cookie: Pluma.Cookie): boolean {
    return cookie.domain && cookie.domain.charAt(0) === '.';
  }

  /*
   * returns true if the scheme is in an allowed format
   */
  private isValidScheme(scheme: string): boolean {
    /* include 'about' (the default JSDOM scheme) to allow
     * priming cookies prior to visiting a site
     */
    const VALID_SCHEMES = ['http', 'https', 'ftp', 'about'];
    return VALID_SCHEMES.includes(scheme);
  }

  /**
   * sets a cookie on the browser
   */
  addCookie(cookie: Pluma.Cookie): void {
    if (!this.dom.window) {
      throw new PlumaError.NoSuchWindow();
    }

    const activeUrl: string = this.getUrl();
    const activeDomain: string = Utils.extractDomainFromUrl(activeUrl);
    const scheme = activeUrl.substr(0, activeUrl.indexOf(':'));

    if (!this.isValidScheme(scheme)) {
      throw new PlumaError.InvalidArgument(`scheme "${scheme}" is invalid.`);
    }

    const shallowClonedCookie = this.isCookieDomainDotPrefixed(cookie)
      ? this.cloneCookieWithoutDomainDotPrefix(cookie)
      : { ...cookie };

    if (!CookieValidator.isValidCookie(shallowClonedCookie)) {
      throw new PlumaError.InvalidArgument();
    }

    const {
      name: key,
      expiry: expires,
      ...remainingFields
    } = this.createCookieJarOptions(shallowClonedCookie, activeDomain);

    this.dom.cookieJar.store.putCookie(
      new Cookie({
        key,
        // CookieJar only accepts a Date object here, not a number
        ...(expires ? [new Date(expires)] : []),
        ...remainingFields,
      }),
      err => {
        if (err) {
          throw new PlumaError.UnableToSetCookie(err);
        }
      },
    );
  }

  /**
   * returns all cookies in the cookie jar
   */
  getCookies(): Pluma.Cookie[] {
    const cookies = [];

    this.dom.cookieJar.serialize((err, serializedJar) => {
      if (err) throw err;
      serializedJar.cookies.forEach(cookie => {
        const currentCookie: Pluma.Cookie = { name: '', value: '' };
        Object.keys(cookie).forEach(key => {
          // renames 'key' property to 'name' for W3C compliance and selenium functionality
          if (key === 'key') currentCookie.name = cookie[key];
          else if (key === 'expires') {
            // sets the expiry time in seconds form epoch time
            // renames property for selenium functionality
            const seconds = new Date(currentCookie[key]).getTime();
            currentCookie.expiry = seconds;
          } else currentCookie[key] = cookie[key];
        });
        delete currentCookie.creation;
        cookies.push(currentCookie);
      });
    });

    return cookies;
  }

  /**
   * returns true if the cookie is associated with the current
   * browsing context's active document
   */
  private isAssociatedCookie({ path, domain }: Pluma.Cookie): boolean {
    const { pathname, hostname }: URL = new URL(this.getUrl());
    return new RegExp(`^${path}`).test(pathname) && hostname.includes(domain);
  }

  /**
   * returns the cookie in the cookie jar matching the requested name
   */
  public getNamedCookie(requestedName: string): Pluma.Cookie {
    const requestedCookie = this.getCookies().find(
      (cookie: Pluma.Cookie): boolean =>
        cookie.name === requestedName && this.isAssociatedCookie(cookie),
    );

    if (!requestedCookie) throw new PlumaError.NoSuchCookie();
    return requestedCookie;
  }

  /**
   * delete associated cookies from the cookie jar matching a regexp pattern
   */
  public deleteCookies(pattern: RegExp): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.getCookies()
        .filter(
          (cookie: Pluma.Cookie): boolean =>
            pattern.test(cookie.name) && this.isAssociatedCookie(cookie),
        )
        .forEach(({ domain, path, name }: Pluma.Cookie): void => {
          this.dom.cookieJar.store.removeCookie(domain, path, name, err => {
            if (err) reject(err);
          });
        });
      resolve();
    });
  }

  /**
   * Returns true if the element is not attached to the DOM.
   * @param element - the HTMLElement to be checked
   * @returns {boolean}
   */
  public isStaleElement(element: HTMLElement): boolean {
    const {
      document: { body },
    } = this.currentBrowsingContextWindow;
    return !body.contains(element);
  }

  /**
   * Switches the current browsing context to an iframe/frame's browsing context
   * or the top-level browsing context if id is null.
   * @param id - the id parameter argument sent to the endpoint
   * @throws {InvalidArgument}
   * @throws {NoSuchFrame}
   */
  public switchToFrame(id: number | string | null): void {
    if (typeof id === 'number') {
      if (id < 0 || id > Number.MAX_SAFE_INTEGER) {
        throw new PlumaError.InvalidArgument(
          'Frame id number must be greater than 0 and less than 2^16 - 1.',
        );
      }

      const frameWindow: Window = this.currentBrowsingContextWindow.frames[id];
      if (!frameWindow) {
        throw new PlumaError.NoSuchFrame(`No frame found at id ${id}.`);
      }

      this.currentBrowsingContextWindow = frameWindow;
    } else if (id === null) {
      this.currentBrowsingContextWindow = this.dom.window;
    } else if (typeof id[ELEMENT] === 'string') {
      const { element }: WebElement = this.getKnownElement(id[ELEMENT]);

      if (this.isStaleElement(element)) {
        throw new PlumaError.StaleElementReference();
      }

      if (Utils.isIframeElement(element) || Utils.isFrameElement(element)) {
        this.currentBrowsingContextWindow = element.contentWindow;
      } else {
        throw new PlumaError.NoSuchFrame('Element must be an iframe or frame.');
      }
    } else {
      throw new PlumaError.NoSuchFrame('Type of id is invalid.');
    }
  }

  /**
   * Find and return an known element by id
   * @param elementId @type {string} the id of a known element in the known element list
   * @throws {StaleElementReference}
   * @throws {NoSuchElement}
   * @returns {WebElement}
   */
  public getKnownElement(elementId: string): WebElement {
    let foundElement: WebElement = null;
    this.knownElements.forEach((element: WebElement) => {
      if (element[ELEMENT] === elementId) foundElement = element;
    });
    if (!foundElement) throw new PlumaError.NoSuchElement();
    if (this.isStaleElement(foundElement.element)) {
      throw new PlumaError.StaleElementReference();
    }
    return foundElement;
  }

  /**
   * returns a string serialization of the DOM
   */
  getPageSource(): string {
    return this.dom.serialize();
  }

  /**
   * terminates all scripts and timers initiated in jsdom vm
   */
  close() {
    this.dom.window.close();
  }
}

export { Browser };
