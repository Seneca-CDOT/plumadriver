import uuidv1 from 'uuid/v1';
import validator from 'validator';
import os from 'os';
import { Mutex } from 'async-mutex';
import { VM } from 'vm2';
import { JSDOM } from 'jsdom';
import has from 'has';

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
  /** indicated whether untrusted or self-signed TLS certificates should be trusted for the duration of the webdriver session */
  acceptInsecureCerts: boolean;
  /** records the timeout duration values used to control the behavior of script evaluation, navigation and element retrieval */
  timeouts: Pluma.Timeouts;
  /**
   * a queue of [[Pluma.Request]] currently awaiting processing
   *  */
  mutex: Mutex;
  proxy: string;

  constructor(requestBody) {
    this.id = uuidv1();
    this.pageLoadStrategy = 'normal';
    this.acceptInsecureCerts = true;
    this.timeouts = {
      implicit: 0,
      pageLoad: 300000,
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

    switch (command) {
      case COMMANDS.DELETE_SESSION:
        await this.browser.close();
        break;
      case COMMANDS.NAVIGATE_TO:
        await this.navigateTo(parameters.url);
        break;
      case COMMANDS.GET_CURRENT_URL:
        response = this.browser.getUrl();
        break;
      case COMMANDS.GET_TITLE:
        response = this.browser.getTitle();
        break;
      case COMMANDS.FIND_ELEMENT:
        response = this.elementRetrieval(
          this.browser.getCurrentBrowsingContextWindow().document,
          parameters.using,
          parameters.value,
        )[0];
        if (!response) throw new NoSuchElement();
        break;
      case COMMANDS.FIND_ELEMENTS:
        response = this.elementRetrieval(
          this.browser.getCurrentBrowsingContextWindow().document,
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
        response = await this.browser.getAllCookies();
        break;
      case COMMANDS.ADD_COOKIE:
        response = this.browser.addCookie(parameters.cookie);
        break;
      case COMMANDS.GET_NAMED_COOKIE:
        if (!this.browser.dom.window) throw new NoSuchWindow();
        const retrievedCookie = await this.browser.getNamedCookie(
          urlVariables.cookieName,
        );
        response = { value: retrievedCookie };
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
        await this.sendKeysToElement(parameters.text, urlVariables.elementId);
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
      case COMMANDS.GET_PAGE_SOURCE:
        if (!this.browser.dom.window) throw new NoSuchWindow();
        response = this.browser.getPageSource();
        break;
      case COMMANDS.GET_ACTIVE_ELEMENT:
        if (!this.browser.dom.window) throw new NoSuchWindow();
        response = this.addElementToKnownElements(
          this.browser.getActiveElement(),
        );
        break;
      case COMMANDS.SWITCH_TO_FRAME:
        this.browser.switchToFrame(parameters.id);
        response = { value: null };
        break;
      case COMMANDS.SWITCH_TO_PARENT_FRAME:
        this.browser.switchToParentFrame();
        response = { value: null };
        break;
      case COMMANDS.ELEMENT_SELECTED:
        if (!this.browser.dom.window) throw new NoSuchWindow();
        const isSelected = this.browser
          .getKnownElement(urlVariables.elementId)
          .isSelected();
        response = { value: isSelected };
        break;
      default:
        break;
    }
    return response || { value: null };
  }

  /**
   * Accepts a string and an elementId @type {string}
   * Tries to locate the element with the user provided Id and insert the specified string of text
   * sets a user defined value on a given HTML element
   * TODO: this method needs to be updated to incorporate the action Object
   */
  sendKeysToElement(text: string, elementId: string): Promise<void> {
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

      if (this.browser.getActiveElement() !== element) element.focus();

      if (element.tagName.toLowerCase() === 'input') {
        if (typeof text === 'string') reject(new InvalidArgument());
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
          if (!has(element, 'value') || element.getAttribute('readonly'))
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
  async navigateTo(url: string): Promise<void> {
    let pathType: string;

    try {
      if (validator.isURL(url)) pathType = 'url';
      else if (await utils.fileSystem.pathExists(url)) pathType = 'file';
      else throw new InvalidArgument();
    } catch (e) {
      throw new InvalidArgument();
    }

    // pageload timer
    let timer;
    const startTimer = (): void => {
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

  setTimeouts(timeouts): void {
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
  configureSession(requestedCapabilities): void {
    // configure Session object capabilities
    const configuredCapabilities = this.configureCapabilities(
      requestedCapabilities,
    );
    // extract browser specific data
    const browserConfig = configuredCapabilities['plm:plumaOptions'];
    if (has(configuredCapabilities, 'acceptInsecureCerts')) {
      this.acceptInsecureCerts = configuredCapabilities.acceptInsecureCerts;
      browserConfig.strictSSL = !this.acceptInsecureCerts;
    }

    if (has(configuredCapabilities, 'rejectPublicSuffixes')) {
      browserConfig.rejectPublicSuffixes =
        configuredCapabilities.rejectPublicSuffixes;
    }

    if (configuredCapabilities.unhandledPromptBehavior) {
      browserConfig.unhandledPromptBehavior =
        configuredCapabilities.unhandledPromptBehavior;
    }

    this.browser = new Browser(browserConfig);
  }

  // configures session object capabilities
  configureCapabilities(requestedCapabilities): Pluma.Capabilities {
    const capabilities = Session.processCapabilities(requestedCapabilities);
    if (capabilities === null)
      throw new SessionNotCreated('capabilities object is null');

    // configure pageLoadStrategy
    if (
      has(capabilities, 'pageLoadStrategy') &&
      typeof capabilities.pageLoadStrategy === 'string'
    ) {
      this.pageLoadStrategy = capabilities.pageLoadStrategy;
    } else {
      capabilities.pageLoadStrategy = 'normal';
    }

    if (has(capabilities, 'proxy')) {
      // TODO: set JSDOM proxy address
    } else {
      capabilities.proxy = {};
    }

    if (has(capabilities, 'timeouts')) {
      this.setTimeouts(capabilities.timeouts);
    }
    capabilities.timeouts = this.timeouts;

    return capabilities;
  }

  /**
   * processes and validates the user defined capabilities
   */
  static processCapabilities({ capabilities }): Pluma.Capabilities {
    const capabilityValidator = new CapabilityValidator();

    const defaultCapabilities = [
      'acceptInsecureCerts',
      'browserName',
      'browserVersion',
      'platformName',
      'pageLoadStrategy',
      'proxy',
      'timeouts',
      'unhandledPromptBehavior',
      'plm:plumaOptions',
    ];

    if (
      !capabilities ||
      capabilities.constructor !== Object ||
      Object.keys(capabilities).length === 0
    ) {
      throw new InvalidArgument();
    }

    // validate alwaysMatch capabilities
    const requiredCapabilities = {};
    if (capabilities.alwaysMatch !== undefined) {
      defaultCapabilities.forEach(key => {
        if (has(capabilities.alwaysMatch, key)) {
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
      !Array.isArray(allMatchedCapabilities) ||
      allMatchedCapabilities.length === 0
    ) {
      throw new InvalidArgument();
    }
    /**
     * @param {Array[Capability]} validatedFirstMatchCapabilities contains
     * a list of all the validated firstMatch capabilities requested by the client
     */
    const validatedFirstMatchCapabilities = [];

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
      validatedFirstMatchCapabilities.push(validatedFirstMatchCapability);
    });

    // attempt merging capabilities
    const mergedCapabilities = [];

    validatedFirstMatchCapabilities.forEach(firstMatch => {
      const merged = Session.mergeCapabilities(
        requiredCapabilities,
        firstMatch,
      );
      mergedCapabilities.push(merged);
    });

    for (const capabilites of mergedCapabilities) {
      const matchedCapabilities = Session.matchCapabilities(capabilites);
      if (matchedCapabilities !== null) {
        return matchedCapabilities;
      }
    }

    throw new SessionNotCreated('Capabilities could not be matched');
  }

  /**
   * accepts required primary and secondary capabilities
   * merges any overlapping capabilities
   */
  static mergeCapabilities(primary, secondary): Record<string, unknown> {
    const result = {};
    Object.keys(primary).forEach(key => {
      result[key] = primary[key];
    });

    if (secondary === undefined) return result;

    Object.keys(secondary).forEach(property => {
      if (has(primary, property)) {
        throw new InvalidArgument();
      }
      result[property] = secondary[property];
    });

    return result;
  }

  /**
   * matches implementation capabilities with the merged capabilities
   * */
  static matchCapabilities(capabilities): Pluma.Capabilities {
    const matchedCapabilities = {
      browserName: 'pluma',
      browserVersion: utils.getVersion(),
      platformName: os.platform(),
      acceptInsecureCerts: false,
      setWindowRect: false,
    };

    // TODO: add extension capabilities here in the future
    let flag = true;
    Object.keys(capabilities).forEach(property => {
      switch (property) {
        case 'browserName':
        case 'platformName':
          if (capabilities[property] !== matchedCapabilities[property])
            flag = false;
          break;
        case 'browserVersion':
          // TODO: change to comparison algorith once more versions are released
          if (capabilities[property] !== matchedCapabilities[property])
            flag = false;
          break;
        case 'setWindowRect':
          if (capabilities[property]) throw new InvalidArgument();
          break;
        // TODO: add proxy matching in the future
        default:
          break;
      }
      if (flag) matchedCapabilities[property] = capabilities[property];
    });

    if (flag) return matchedCapabilities;

    return null;
  }

  /**
   * attempts to find a [[WebElement]] from a given startNode, selection strategy and selector
   */
  elementRetrieval(
    startNode,
    strategy,
    selector,
  ): NodeList | HTMLCollection | HTMLElement[] {
    const endTime = new Date(new Date().getTime() + this.timeouts.implicit);
    let elements;
    const result = [];

    if (!strategy || !selector) throw new InvalidArgument();
    if (!startNode) throw new NoSuchElement();

    const locationStrategies = {
      cssSelector(): NodeList {
        return startNode.querySelectorAll(selector);
      },
      linkTextSelector(partial = false): HTMLElement[] {
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
      tagName(): HTMLCollection {
        return startNode.getElementsByTagName(selector);
      },
      XPathSelector(document): HTMLElement[] {
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
              this.browser.getCurrentBrowsingContextWindow().document,
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
   * Adds an HTMLElement to the array of known elements
   * @param {HTMLElement} element
   * @returns {Object} the JSON representation of the WebElement
   */
  private addElementToKnownElements(
    element: HTMLElement,
  ): Pluma.SerializedWebElement {
    const webElement = new WebElement(element);
    this.browser.knownElements.push(webElement);
    return webElement.serialize();
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

    const window = this.browser.getCurrentBrowsingContextWindow();

    const func = window
      .eval(`(function() {${script}})`)
      .bind(null, ...argumentList);

    const vm = new VM({
      timeout: this.timeouts.script,
      sandbox: {
        func,
      },
    });

    let vmReturnValue;

    try {
      vmReturnValue = vm.run('func();');
    } catch (error) {
      this.handleSyncScriptError(error);
    }

    // TODO: incorporate @types/jsdom to resolve typescript instanceof errors
    // eslint-disable-next-line
    const { NodeList, HTMLCollection, HTMLElement } = window as any;

    if (
      vmReturnValue instanceof NodeList ||
      vmReturnValue instanceof HTMLCollection
    ) {
      vmReturnValue = Array.from(vmReturnValue);
    }

    if (Array.isArray(vmReturnValue)) {
      return vmReturnValue.map(value =>
        value instanceof HTMLElement
          ? this.addElementToKnownElements(value)
          : value,
      );
    } else if (vmReturnValue instanceof HTMLElement) {
      return this.addElementToKnownElements(vmReturnValue);
    }

    // client will expect undefined return values to be null
    return typeof vmReturnValue === 'undefined' ? null : vmReturnValue;
  }
}

export { Session };
