import uuidv1 from 'uuid/v1';
import os from 'os';
import { Mutex } from 'async-mutex';
import { JSDOM } from 'jsdom';
import has from 'has';

import { WebElement } from '../WebElement/WebElement';
import { COMMANDS } from '../constants/constants';
import { Browser } from '../Browser/Browser';
import { Pluma } from '../Types/types';
import { sendKeysToElement } from './SendKeysToElement';
import { navigateTo } from './NavigateTo';
import { addElementToKnownElements } from './AddToKnownElements';
import * as utils from '../utils/utils';

// custom

// DOM specific
const {
  /** A window event, imported from jsdom */

  /** jsdom implementation of the HTMLElement object */

  HTMLElement,
} = new JSDOM().window;

// errors
import {
  InvalidArgument,
  SessionNotCreated,
  NoSuchElement,
  NoSuchWindow,
} from '../Error/errors';

import { CapabilityValidator } from '../CapabilityValidator/CapabilityValidator';
import { executeScript } from './ExecuteScript';

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
        await navigateTo(parameters.url, this.browser, this.timeouts);
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
        const value: unknown = await executeScript(
          parameters.script,
          parameters.args,
          this.browser,
          this.timeouts,
        );
        response = { value };
        break;
      case COMMANDS.ELEMENT_SEND_KEYS:
        await sendKeysToElement(
          parameters.text,
          urlVariables.elementId,
          this.browser,
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
      case COMMANDS.GET_PAGE_SOURCE:
        if (!this.browser.dom.window) throw new NoSuchWindow();
        response = this.browser.getPageSource();
        break;
      case COMMANDS.GET_ACTIVE_ELEMENT:
        if (!this.browser.dom.window) throw new NoSuchWindow();
        response = addElementToKnownElements(
          this.browser.getActiveElement(),
          this.browser,
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
  static mergeCapabilities(primary, secondary): Pluma.Capabilities | {} {
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
}

export { Session };
