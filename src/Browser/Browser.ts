import { JSDOM } from 'jsdom';
import { Cookie } from 'tough-cookie';
import BrowserConfig from './BrowserConfig';
import Pluma from '../Types/types';
import { ELEMENT } from '../constants/constants';
import WebElement from '../WebElement/WebElement';
import * as Utils from '../utils/utils';
import * as PlumaError from '../Error/errors';
import CookieValidator from './CookieValidator';

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
  dom!: JSDOM;

  /** the Window of the current browsing context */
  private currentBrowsingContextWindow!: Pluma.DOMWindow;

  /** accepts a capabilities object with jsdom and plumadriver specific options */
  constructor(capabilities: Pluma.PlumaOptions) {
    const browserOptions: Pluma.BrowserOptions = {
      runScripts: 'dangerously',
      strictSSL: true,
      unhandledPromptBehavior: 'dismiss and notify',
      rejectPublicSuffixes: false,
      idleTime: 120,
      ...capabilities,
    };

    this.browserConfig = new BrowserConfig(browserOptions);
    this.configureBrowser(this.browserConfig, null);
  }

  /**
   * Creates an empty jsdom object from a url or file path depending on the url pathType parameter value.
   * Accepts a [[BrowserConfig]] object used to configure the jsdom object
   */
  async configureBrowser(
    config: BrowserConfig,
    url: string | null,
    pathType = 'url',
  ): Promise<void> {
    let dom: JSDOM;

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
      const loadEvent = (): Promise<JSDOM> =>
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
  private handleNavigationError(
    error: { statusCode: number },
    config: BrowserConfig,
  ): void {
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
  async navigate(path?: string, pathType?: string): Promise<boolean> {
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
  public getCurrentBrowsingContextWindow(): Pluma.DOMWindow {
    return this.currentBrowsingContextWindow;
  }

  /**
   * Set the Window for the current browsing context.
   * @param {Window} window - the Window object
   */
  public setCurrentBrowsingContextWindow(window: Pluma.DOMWindow): void {
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

  private static createCookieJarOptions(
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
  private static cloneCookieWithoutDomainDotPrefix(
    cookie: Pluma.Cookie,
  ): Pluma.Cookie {
    return {
      ...cookie,
      domain: cookie.domain?.replace(/^\./, ''),
    };
  }

  /*
   * returns true if the cookie domain is prefixed with a dot
   */
  private static isCookieDomainDotPrefixed(cookie: Pluma.Cookie): boolean {
    return !!cookie.domain && cookie.domain.charAt(0) === '.';
  }

  /*
   * returns true if the scheme is in an allowed format
   */
  private static isValidScheme(scheme: string): boolean {
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

    if (!Browser.isValidScheme(scheme)) {
      throw new PlumaError.InvalidArgument(`scheme "${scheme}" is invalid.`);
    }

    const shallowClonedCookie = Browser.isCookieDomainDotPrefixed(cookie)
      ? Browser.cloneCookieWithoutDomainDotPrefix(cookie)
      : { ...cookie };

    if (!CookieValidator.isValidCookie(shallowClonedCookie)) {
      throw new PlumaError.InvalidArgument();
    }

    const {
      name: key,
      expiry: expires,
      ...remainingFields
    } = Browser.createCookieJarOptions(shallowClonedCookie, activeDomain);

    this.dom.cookieJar.store.putCookie(
      new Cookie({
        key,
        // CookieJar only accepts a Date object here, not a number
        ...(expires ? [new Date(expires)] : []),
        ...remainingFields,
      }),
      err => {
        if (err) {
          throw new PlumaError.UnableToSetCookie(err && err.message);
        }
      },
    );
  }

  /**
   * returns all cookies in the cookie jar
   */
  public getAllCookies(): Promise<Pluma.Cookie[]> {
    return new Promise((resolve, reject) => {
      this.dom.cookieJar.serialize((err, serializedJar) => {
        if (err) {
          reject(err);
        }

        const cookies: Pluma.Cookie[] = serializedJar.cookies
          .map(cookie => {
            const currentCookie: Pluma.Cookie = { name: '', value: '' };
            Object.keys(cookie).forEach(key => {
              // renames 'key' property to 'name' for W3C compliance and selenium functionality
              if (key === 'key') currentCookie.name = cookie[key];
              else if (key === 'expires') {
                // sets the expiry time in seconds form epoch time
                // renames property for selenium functionality
                const seconds = new Date(cookie[key]).getTime();
                currentCookie.expiry = seconds;
              } else Utils.copyProperty(currentCookie, cookie, key);
            });
            delete currentCookie.creation;
            return currentCookie;
          })
          .filter((cookie: Pluma.Cookie) => this.isAssociatedCookie(cookie));

        resolve(cookies);
      });
    });
  }

  /**
   * returns true if the cookie is associated with the current
   * browsing context's active document
   */
  private isAssociatedCookie({ path, domain }: Pluma.Cookie): boolean {
    const { pathname, hostname }: URL = new URL(this.getUrl());
    return (
      new RegExp(`^${path}`).test(pathname) &&
      !!domain &&
      hostname.includes(domain)
    );
  }

  /**
   * returns the cookie in the cookie jar matching the requested name
   */
  public async getNamedCookie(requestedName: string): Promise<Pluma.Cookie> {
    const allCookies = await this.getAllCookies();
    const requestedCookie = allCookies.find(
      (cookie: Pluma.Cookie): boolean =>
        cookie.name === requestedName && this.isAssociatedCookie(cookie),
    );

    if (!requestedCookie) throw new PlumaError.NoSuchCookie();
    return requestedCookie;
  }

  /**
   * delete associated cookies from the cookie jar matching a regexp pattern
   */
  public async deleteCookies(pattern: RegExp): Promise<void> {
    const allCookies: Pluma.Cookie[] = await this.getAllCookies();

    allCookies
      .filter((cookie: Pluma.Cookie): boolean => pattern.test(cookie.name))
      .forEach(({ domain, path, name }: Pluma.Cookie): void => {
        if (domain && path) {
          this.dom.cookieJar.store.removeCookie(domain, path, name, err => {
            if (err) throw err;
          });
        }
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
  public switchToFrame(id: unknown): void {
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
    } else if (Utils.isJsonWebElement(id)) {
      const { element }: WebElement = this.getKnownElement(id[ELEMENT]);

      if (this.isStaleElement(element)) {
        throw new PlumaError.StaleElementReference();
      }

      if (Utils.isIframeElement(element) || Utils.isFrameElement(element)) {
        this.currentBrowsingContextWindow = element.contentWindow as Window;
      } else {
        throw new PlumaError.NoSuchFrame('Element must be an iframe or frame.');
      }
    } else {
      throw new PlumaError.NoSuchFrame('Type of id is invalid.');
    }
  }

  /**
   * Sets the current browsing context for future commands to the parent of the current browsing context.
   */
  public switchToParentFrame(): void {
    if (!this.currentBrowsingContextWindow) {
      throw new PlumaError.NoSuchWindow();
    }

    this.currentBrowsingContextWindow = this.currentBrowsingContextWindow.parent;
  }

  /**
   * Find and return an known element by id
   * @param elementId @type {string} the id of a known element in the known element list
   * @throws {StaleElementReference}
   * @throws {NoSuchElement}
   * @returns {WebElement}
   */
  public getKnownElement(elementId?: string): WebElement {
    const foundElement = this.knownElements.find(
      element => element[ELEMENT] === elementId,
    );
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
  close(): void {
    this.dom.window.close();
  }
}
export default Browser;
