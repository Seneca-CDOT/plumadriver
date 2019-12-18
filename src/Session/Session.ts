import * as uuidv1 from 'uuid/v1';
import validator from 'validator';
import * as os from 'os';
import { Mutex } from 'async-mutex';
import { VM } from 'vm2';
import { JSDOM } from 'jsdom';

import { WebElement } from '../WebElement/WebElement';
import { COMMANDS, ELEMENT } from '../constants/constants';
import { Browser } from '../Browser/Browser';
import { Pluma } from '../Types/types';
import * as utils from '../utils/utils';

// custom
import { addFileList } from '../jsdom_extensions/addFileList';

// DOM specific
const {
  /** A window event, imported from jsdom */

  Event,
  /** jsdom implementation of the HTMLElement object */

  HTMLElement,
} = new JSDOM().window;

// errors
import {
  InvalidArgument,
  SessionNotCreated,
  NoSuchElement,
  ElementNotInteractable,
  NoSuchWindow,
  JavaScriptError,
  ScriptTimeout,
} from '../Error/errors';

import { CapabilityValidator } from '../CapabilityValidator/CapabilityValidator';

/**
 * Represents the connection between a local end and a specific remote end. In this case, jsdom.
 * Has a unique session Id that can be used to differentiate one session from another.
 */
class Session {
  /** the session id */
  readonly id: string;
  /** the user agent */
  browser: Browser;
  /** */
  pageLoadStrategy: Pluma.PageLoadStrategy = 'normal';
  /** indicated wherher untrusted or self-signed TLS certificates should be trusted for the duration of the webdrive session */
  secureTLS: boolean;
  /** records the timeout duration values used to control the behaviour of script evaluation, navigation and element retrieval */
  timeouts: Pluma.Timeouts;
  /**
   * a queue of [[Pluma.Request]] currently awaiting processsing
   *  */
  mutex: Mutex;
  proxy: Record<string, unknown> | null;

  constructor(requestBody) {
    this.id = uuidv1();
    this.pageLoadStrategy = 'normal';
    this.secureTLS = true;
    this.timeouts = {
      implicit: 0,
      pageLoad: 30000,
      script: 30000,
    };
    this.configureSession(requestBody);
    this.mutex = new Mutex();
  }

  /**
   * Accepts a [[Pluma.Request]] object which are executed on a FIFO order inside the
   * [[mutex]] list.
   * Delegates logic execution to different methods depending on the command passed.
   * @returns {Promise}
   */
  async process({
    command,
    parameters,
    urlVariables,
  }: Pluma.Request): Promise<string> {
    let response = null;

    return new Promise(
      async (resolve, reject): Promise<void> => {
        try {
          switch (command) {
            case COMMANDS.DELETE_SESSION:
              await this.browser.close();
              break;
            case COMMANDS.NAVIGATE_TO:
              await this.navigateTo(parameters);
              break;
            case COMMANDS.GET_CURRENT_URL:
              response = this.browser.getUrl();
              break;
            case COMMANDS.GET_TITLE:
              response = this.browser.getTitle();
              break;
            case COMMANDS.FIND_ELEMENT:
              response = this.elementRetrieval(
                this.browser.dom.window.document,
                parameters.using,
                parameters.value,
              )[0];
              if (!response) throw new NoSuchElement();
              break;
            case COMMANDS.FIND_ELEMENTS:
              response = this.elementRetrieval(
                this.browser.dom.window.document,
                parameters.using,
                parameters.value,
              );
              if (response.length === 0) throw new NoSuchElement();
              break;
            case COMMANDS.GET_ELEMENT_TEXT:
              response = this.browser
                .getKnownElement(urlVariables.elementId)
                .getText();
              break;
            case COMMANDS.FIND_ELEMENTS_FROM_ELEMENT:
              response = this.elementRetrieval(
                this.browser.getKnownElement(urlVariables.elementId).element,
                parameters.using,
                parameters.value,
              );
              if (response.length === 0) throw new NoSuchElement();
              break;
            case COMMANDS.FIND_ELEMENT_FROM_ELEMENT:
              response = this.elementRetrieval(
                this.browser.getKnownElement(urlVariables.elementId).element,
                parameters.using,
                parameters.value,
              )[0];
              if (!response) throw new NoSuchElement();
              break;
            case COMMANDS.SET_TIMEOUTS:
              break;
            case COMMANDS.GET_TIMEOUTS:
              break;
            case COMMANDS.GET_ALL_COOKIES:
              response = this.browser.getCookies();
              break;
            case COMMANDS.ADD_COOKIE:
              response = this.browser.addCookie(parameters.cookie);
              break;
            case COMMANDS.GET_NAMED_COOKIE:
              if (!this.browser.dom.window) throw new NoSuchWindow();
              response = this.browser.getNamedCookie(urlVariables.cookieName);
              break;
            case COMMANDS.DELETE_COOKIE:
              if (!this.browser.dom.window) throw new NoSuchWindow();
              await this.browser.deleteCookies(
                new RegExp(`^${urlVariables.cookieName}$`),
              );
              break;
            case COMMANDS.DELETE_ALL_COOKIES:
              if (!this.browser.dom.window) throw new NoSuchWindow();
              await this.browser.deleteCookies(/.*/);
              break;
            case COMMANDS.GET_ELEMENT_TAG_NAME:
              response = this.browser
                .getKnownElement(urlVariables.elementId)
                .getTagName();
              break;
            case COMMANDS.GET_ELEMENT_ATTRIBUTE:
              response = this.browser
                .getKnownElement(urlVariables.elementId)
                .getElementAttribute(urlVariables.attributeName);
              break;
            case COMMANDS.EXECUTE_SCRIPT:
              if (!this.browser.dom.window) throw new NoSuchWindow();
              const value: unknown = await this.executeScript(
                parameters.script,
                parameters.args,
              );
              response = { value };
              break;
            case COMMANDS.ELEMENT_SEND_KEYS:
              await this.sendKeysToElement(
                parameters.text,
                urlVariables.elementId,
              );
              break;
            case COMMANDS.ELEMENT_CLICK:
              if (!this.browser.dom.window) throw new NoSuchWindow();
              this.browser.getKnownElement(urlVariables.elementId).click();
              response = { value: null };
              break;
            case COMMANDS.ELEMENT_CLEAR:
              if (!this.browser.dom.window) throw new NoSuchWindow();
              this.browser.getKnownElement(urlVariables.elementId).clear();
              response = { value: null };
              break;
            case COMMANDS.ELEMENT_ENABLED:
              if (!this.browser.dom.window) throw new NoSuchWindow();
              const isEnabled = this.browser
                .getKnownElement(urlVariables.elementId)
                .isEnabled();
              response = { value: isEnabled };
              break;
            case COMMANDS.ELEMENT_IS_DISPLAYED:
              if (!this.browser.dom.window) throw new NoSuchWindow();
              const { element }: WebElement = this.browser.getKnownElement(
                urlVariables.elementId,
              );
              response = { value: WebElement.isDisplayed(element) };
              break;
            default:
              break;
          }
          resolve(response);
        } catch (err) {
          reject(err);
        }
      },
    );
  }

  /**
   * Accepts a string and an elementId @type {string}
   * Tries to locate the element with the user provided Id and insert the specified string of text
   * sets a user defined value on a given HTML element
   * TODO: this method needs to be updated to incorporate the action Object
   */
  sendKeysToElement(text: string, elementId: string) {
    return new Promise(async (resolve, reject) => {
      const webElement = this.browser.getKnownElement(elementId);
      const element: HTMLElement = webElement.element;
      let files = [];

      if (text === undefined) reject(new InvalidArgument());

      if (
        !webElement.isInteractable() &&
        element.getAttribute('contenteditable') !== 'true'
      ) {
        reject(new ElementNotInteractable()); // TODO: create new error class
      }

      if (this.browser.activeElement !== element) element.focus();

      if (element.tagName.toLowerCase() === 'input') {
        if (text.constructor.name.toLowerCase() !== 'string')
          reject(new InvalidArgument());
        // file input
        if (element.getAttribute('type') === 'file') {
          files = text.split('\n');
          if (files.length === 0) throw new InvalidArgument();
          if (!element.hasAttribute('multiple') && files.length !== 1)
            throw new InvalidArgument();

          await Promise.all(
            files.map(file => utils.fileSystem.pathExists(file)),
          );

          addFileList(element, files);
          element.dispatchEvent(new Event('input'));
          element.dispatchEvent(new Event('change'));
        } else if (
          element.getAttribute('type') === 'text' ||
          element.getAttribute('type') === 'email'
        ) {
          (element as HTMLInputElement).value += text;
          element.dispatchEvent(new Event('input'));
          element.dispatchEvent(new Event('change'));
        } else if (element.getAttribute('type') === 'color') {
          if (!validator.isHexColor(text)) throw new InvalidArgument();
          (element as HTMLInputElement).value = text;
        } else {
          if (
            !Object.prototype.hasOwnProperty.call(element, 'value') ||
            element.getAttribute('readonly')
          )
            throw new Error('element not interactable'); // TODO: create error class
          // TODO: add check to see if element is mutable, reject with element not interactable
          (element as HTMLInputElement).value = text;
        }
        element.dispatchEvent(new Event('input'));
        element.dispatchEvent(new Event('change'));
        resolve(null);
      } else {
        // TODO: text needs to be encoded before it is inserted into the element
        // innerHTML, especially important since js code can be inserted in here and executed
        element.innerHTML += text;
        resolve(null);
      }
    });
  }

  /**
   * navigates to a specified url
   * sets timers according to session config
   */
  async navigateTo({ url }) {
    let pathType;

    try {
      if (validator.isURL(url)) pathType = 'url';
      else if (await utils.fileSystem.pathExists(url)) pathType = 'file';
      else throw new InvalidArgument();
    } catch (e) {
      throw new InvalidArgument();
    }

    // pageload timer
    let timer;
    const startTimer = () => {
      timer = setTimeout(() => {
        throw new Error('timeout'); // TODO: create timeout error class
      }, this.timeouts.pageLoad);
    };

    if (this.browser.getUrl() !== url) {
      startTimer();
      await this.browser.navigate(url, pathType);
      clearTimeout(timer);
    }
  }

  /**
   * sets and validates the [[timeouts]] object
   * */

  setTimeouts(timeouts) {
    const capabilityValidator = new CapabilityValidator();
    let valid = true;
    Object.keys(timeouts).forEach(key => {
      valid = capabilityValidator.validateTimeouts(key, timeouts[key]);
      if (!valid) throw new InvalidArgument();
    });

    Object.keys(timeouts).forEach(validTimeout => {
      this.timeouts[validTimeout] = timeouts[validTimeout];
    });
  }

  /**
   * return the current session's [[timeouts]]
   */
  getTimeouts(): Pluma.Timeouts {
    return this.timeouts;
  }

  /** configures session properties*/
  configureSession(requestedCapabilities) {
    // configure Session object capabilties
    const configuredCapabilities = this.configureCapabilties(
      requestedCapabilities,
    );
    // extract browser specific data
    const browserConfig = configuredCapabilities['plm:plumaOptions'];
    if (
      Object.prototype.hasOwnProperty.call(
        configuredCapabilities,
        'acceptInsecureCerts',
      )
    ) {
      browserConfig.strictSSL = !configuredCapabilities.acceptInsecureCerts;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        configuredCapabilities,
        'rejectPublicSuffixes',
      )
    ) {
      browserConfig.rejectPublicSuffixes =
        configuredCapabilities.rejectPublicSuffixes;
    }

    if (configuredCapabilities.unhandledPromptBehavior) {
      browserConfig.unhandledPromptBehavior =
        configuredCapabilities.unhandledPromptBehavior;
    }

    this.browser = new Browser(browserConfig);
  }

  // configures session object capabilties
  configureCapabilties(requestedCapabilities) {
    const capabilities = Session.processCapabilities(requestedCapabilities);
    if (capabilities === null)
      throw new SessionNotCreated('capabilities object is null');

    // configure pageLoadStrategy
    if (
      Object.prototype.hasOwnProperty.call(capabilities, 'pageLoadStrategy') &&
      typeof capabilities.pageLoadStrategy === 'string'
    ) {
      this.pageLoadStrategy = capabilities.pageLoadStrategy;
    } else {
      capabilities.pageLoadStrategy = 'normal';
    }

    if (Object.prototype.hasOwnProperty.call(capabilities, 'proxy')) {
      // TODO: set JSDOM proxy address
    } else {
      capabilities.proxy = {};
    }

    if (Object.prototype.hasOwnProperty.call(capabilities, 'timeouts')) {
      this.setTimeouts(capabilities.timeouts);
    }
    capabilities.timeouts = this.timeouts;

    return capabilities;
  }

  /**
   * processes and validates the user defined capabilties
   */
  static processCapabilities({ capabilities }) {
    const capabilityValidator = new CapabilityValidator();

    const defaultCapabilities = [
      'acceptInsecureCerts',
      'browserName',
      'browserVersion',
      'platformName',
      'pageLoadStrategy',
      'proxy',
      'timeouts',
      'unhandledPromptBehaviour',
      'plm:plumaOptions',
    ];

    if (
      !capabilities ||
      capabilities.constructor !== Object ||
      Object.keys(capabilities).length === 0
    ) {
      throw new InvalidArgument();
    }

    // validate alwaysMatch capabilties
    const requiredCapabilities = {};
    if (capabilities.alwaysMatch !== undefined) {
      defaultCapabilities.forEach(key => {
        if (
          Object.prototype.hasOwnProperty.call(capabilities.alwaysMatch, key)
        ) {
          const validatedCapability = capabilityValidator.validate(
            capabilities.alwaysMatch[key],
            key,
          );
          if (validatedCapability)
            requiredCapabilities[key] = capabilities.alwaysMatch[key];
          else {
            throw new InvalidArgument();
          }
        }
      });
    }

    // validate first match capabilities
    let allMatchedCapabilities = capabilities.firstMatch;
    if (allMatchedCapabilities === undefined) {
      allMatchedCapabilities = [{}];
    } else if (
      allMatchedCapabilities.constructor.name.toLowerCase() !== 'array' ||
      allMatchedCapabilities.length === 0
    ) {
      throw new InvalidArgument();
    }
    /**
     * @param {Array[Capability]} validatedFirstMatchCapabilties contains
     * a list of all the validated firstMatch capabilties requested by the client
     */
    const validatedFirstMatchCapabilties = [];

    allMatchedCapabilities.forEach(indexedFirstMatchCapability => {
      const validatedFirstMatchCapability = {};
      Object.keys(indexedFirstMatchCapability).forEach(key => {
        const validatedCapability = capabilityValidator.validate(
          indexedFirstMatchCapability[key],
          key,
        );
        if (validatedCapability) {
          validatedFirstMatchCapability[key] = indexedFirstMatchCapability[key];
        }
      });
      validatedFirstMatchCapabilties.push(validatedFirstMatchCapability);
    });

    // attempt merging capabilities
    const mergedCapabilities = [];

    validatedFirstMatchCapabilties.forEach(firstMatch => {
      const merged = Session.mergeCapabilities(
        requiredCapabilities,
        firstMatch,
      );
      mergedCapabilities.push(merged);
    });

    let matchedCapabilities;
    mergedCapabilities.forEach(capabilites => {
      matchedCapabilities = Session.matchCapabilities(capabilites);
      if (matchedCapabilities === null)
        throw new SessionNotCreated('Capabilities could not be matched');
    });

    return matchedCapabilities;
  }

  /**
   * accepts required primary and secondary capabilties
   * merges any overlapping capabilties
   */
  static mergeCapabilities(primary, secondary) {
    const result = {};
    Object.keys(primary).forEach(key => {
      result[key] = primary[key];
    });

    if (secondary === undefined) return result;

    Object.keys(secondary).forEach(property => {
      if (Object.prototype.hasOwnProperty.call(primary, property)) {
        throw new InvalidArgument();
      }
      result[property] = secondary[property];
    });

    return result;
  }

  /**
   * matches implementation capabilties with the merged capabilties
   * */
  static matchCapabilities(capabilties) {
    const matchedCapabilities = {
      browserName: 'pluma',
      browserVersion: 'v1.0',
      platformName: os.platform(),
      acceptInsecureCerts: false,
      setWindowRect: false,
    };

    // TODO: add extension capabilities here in the future
    let flag = true;
    Object.keys(capabilties).forEach(property => {
      switch (property) {
        case 'browserName':
        case 'platformName':
          if (capabilties[property] !== matchedCapabilities[property])
            flag = false;
          break;
        case 'browserVersion':
          // TODO: change to comparison algorith once more versions are released
          if (capabilties[property] !== matchedCapabilities[property])
            flag = false;
          break;
        case 'setWindowRect':
          if (capabilties[property]) throw new InvalidArgument();
          break;
        // TODO: add proxy matching in the future
        default:
          break;
      }
      if (flag) matchedCapabilities[property] = capabilties[property];
    });

    if (flag) return matchedCapabilities;

    return null;
  }

  /**
   * attempts to find a [[WebElement]] from a given startNode, selection strategy and selector
   */
  elementRetrieval(startNode, strategy, selector) {
    // TODO: check if element is connected (shadow-root) https://dom.spec.whatwg.org/#connected
    // check W3C endpoint spec for details
    const endTime = new Date(new Date().getTime() + this.timeouts.implicit);
    let elements;
    const result = [];

    if (!strategy || !selector) throw new InvalidArgument();
    if (!startNode) throw new NoSuchElement();

    const locationStrategies = {
      cssSelector() {
        return startNode.querySelectorAll(selector);
      },
      linkTextSelector(partial = false) {
        const linkElements = startNode.querySelectorAll('a');
        const strategyResult = [];

        linkElements.forEach(element => {
          const renderedText = element.innerHTML;
          if (!partial && renderedText.trim() === selector)
            strategyResult.push(element);
          else if (partial && renderedText.includes(selector))
            strategyResult.push(element);
        });
        return result;
      },
      tagName() {
        return startNode.getElementsByTagName(selector);
      },
      XPathSelector(document) {
        const evaluateResult = document.evaluate(selector, startNode, null, 7);
        const length = evaluateResult.snapshotLength;
        const xPathResult = []; // according to W3C this should be a NodeList
        for (let i = 0; i < length; i++) {
          const node = evaluateResult.snapshotItem(i);
          xPathResult.push(node);
        }
        return xPathResult;
      },
    };

    do {
      try {
        switch (strategy) {
          case 'css selector':
            elements = locationStrategies.cssSelector();
            break;
          case 'link text':
            elements = locationStrategies.linkTextSelector();
            break;
          case 'partial link text':
            elements = locationStrategies.linkTextSelector(true);
            break;
          case 'tag name':
            elements = locationStrategies.tagName();
            break;
          case 'xpath':
            elements = locationStrategies.XPathSelector(
              this.browser.dom.window.document,
            );
            break;
          default:
            throw new InvalidArgument();
        }
      } catch (error) {
        // if (
        //   error instanceof DOMException
        //   || error instanceof SyntaxError
        //   || error instanceof XPathException
        // ) throw new Error('invalid selector');
        // // TODO: add invalidSelector error class
        // else throw new UnknownError(); // TODO: add unknown error class
        console.log(error);
      }
    } while (endTime > new Date() && elements.length < 1);

    elements.forEach(element => {
      const foundElement = new WebElement(element);
      result.push(foundElement);
      this.browser.knownElements.push(foundElement);
    });
    return result;
  }

  /**
   * handles errors resulting from failing to execute synchronous scripts
   */
  private handleSyncScriptError({
    message,
    code,
  }: NodeJS.ErrnoException): never {
    if (code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
      throw new ScriptTimeout();
    } else {
      throw new JavaScriptError(message);
    }
  }

  /**
   * executes a user defined script within the context of the dom on a given set of user defined arguments
   */
  public executeScript(script: string, args: unknown[]): unknown {
    const argumentList = args.map(arg => {
      if (arg[ELEMENT] == null) {
        return arg;
      } else {
        const { element } = this.browser.getKnownElement(arg[ELEMENT]);
        return element;
      }
    });

    const { window } = this.browser.dom;

    const func = window
      .eval(`(function() {${script}})`)
      .bind(null, ...argumentList);

    const vm = new VM({
      timeout: this.timeouts.script,
      sandbox: {
        func,
      },
    });

    const createElementAndAddToKnownElements = value => {
      const element = new WebElement(value);
      this.browser.knownElements.push(element);
      return element.serialize();
    };

    let vmReturnValue;

    try {
      vmReturnValue = vm.run('func();');
    } catch (error) {
      this.handleSyncScriptError(error);
    }

    const { NodeList, HTMLCollection } = window;

    if (
      vmReturnValue instanceof NodeList ||
      vmReturnValue instanceof HTMLCollection
    ) {
      vmReturnValue = Array.from(vmReturnValue);
    }

    if (Array.isArray(vmReturnValue)) {
      return vmReturnValue.map(value =>
        value instanceof HTMLElement
          ? createElementAndAddToKnownElements(value)
          : value,
      );
    } else if (vmReturnValue instanceof HTMLElement) {
      return createElementAndAddToKnownElements(vmReturnValue);
    }

    // client will expect undefined return values to be null
    return typeof vmReturnValue === 'undefined' ? null : vmReturnValue;
  }
}

export { Session };
