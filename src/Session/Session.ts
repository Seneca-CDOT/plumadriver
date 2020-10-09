import { v1 as uuidv1 } from 'uuid';
import os from 'os';
import { Mutex } from 'async-mutex';
import { JSDOM } from 'jsdom';
import has from 'has';

import WebElement from '../WebElement/WebElement';
import Browser from '../Browser/Browser';
import Pluma from '../Types/types';
import * as utils from '../utils/utils';

// errors
import {
  InvalidArgument,
  SessionNotCreated,
  NoSuchElement,
} from '../Error/errors';

import CapabilityValidator from '../CapabilityValidator/CapabilityValidator';
import commandHandlers from './command-handlers';

// DOM specific
const {
  /** A window event, imported from jsdom */

  HTMLElement,
} = new JSDOM().window;

/**
 * Represents the connection between a local end and a specific remote end. In this case, jsdom.
 * Has a unique session Id that can be used to differentiate one session from another.
 */
class Session {
  /** the session id */
  readonly id: string;

  /** the user agent */
  browser!: Browser;

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

  proxy = '';

  constructor(requestBody: Record<string, unknown>) {
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
  async process(req: Pluma.Request): Promise<unknown> {
    const response = await commandHandlers[req.command]({
      session: this,
      ...req,
    });
    return response || { value: null };
  }

  /**
   * sets and validates the [[timeouts]] object
   * */

  setTimeouts(timeouts: Pluma.Timeouts): void {
    const capabilityValidator = new CapabilityValidator();
    let valid = true;
    Object.keys(timeouts).forEach(key => {
      valid = capabilityValidator.validateTimeouts(
        key,
        timeouts[key as keyof Pluma.Timeouts],
      );
      if (!valid) throw new InvalidArgument();
    });

    Object.keys(timeouts).forEach(validTimeout => {
      utils.copyProperty(
        this.timeouts,
        timeouts,
        validTimeout as keyof Pluma.Timeouts,
      );
    });
  }

  /**
   * return the current session's [[timeouts]]
   */
  getTimeouts(): Pluma.Timeouts {
    return this.timeouts;
  }

  /** configures session properties */
  configureSession(requestedCapabilities: Record<string, unknown>): void {
    // configure Session object capabilities
    const configuredCapabilities = this.configureCapabilities(
      requestedCapabilities,
    );
    // extract browser specific data
    const browserConfig: Pluma.PlumaOptions =
      configuredCapabilities['plm:plumaOptions'] || {};
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
  configureCapabilities(
    requestedCapabilities: Record<string, unknown>,
  ): Pluma.Capabilities {
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

    if (has(capabilities, 'timeouts') && capabilities.timeouts) {
      this.setTimeouts(capabilities.timeouts);
    }
    capabilities.timeouts = this.timeouts;

    return capabilities;
  }

  /**
   * processes and validates the user defined capabilities
   */
  static processCapabilities(
    params: Record<string, unknown>,
  ): Pluma.Capabilities {
    const { capabilities } = params;
    const capabilityValidator = new CapabilityValidator();

    const defaultCapabilities: (keyof Pluma.Capabilities)[] = [
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
      !utils.isObject(capabilities) ||
      Object.keys(capabilities).length === 0
    ) {
      throw new InvalidArgument();
    }

    // validate alwaysMatch capabilities
    const { alwaysMatch } = capabilities;
    const requiredCapabilities: Partial<Pluma.Capabilities> = {};
    if (utils.isObject(alwaysMatch)) {
      defaultCapabilities.forEach(key => {
        if (key in alwaysMatch) {
          const validatedCapability = capabilityValidator.validate(
            alwaysMatch[key],
            key,
          );
          if (validatedCapability) {
            utils.copyProperty(requiredCapabilities, alwaysMatch, key);
          } else {
            throw new InvalidArgument();
          }
        }
      });
    }

    // validate first match capabilities:
    const allMatchedCapabilities =
      typeof capabilities.firstMatch === 'undefined'
        ? [{}]
        : capabilities.firstMatch;

    if (
      !Array.isArray(allMatchedCapabilities) ||
      allMatchedCapabilities.length === 0
    ) {
      throw new InvalidArgument();
    }
    /**
     * @param {Array[Capability]} validatedFirstMatchCapabilities contains
     * a list of all the validated firstMatch capabilities requested by the client
     */
    const validatedFirstMatchCapabilities: Partial<Pluma.Capabilities>[] = [];

    allMatchedCapabilities.forEach(indexedFirstMatchCapability => {
      const validatedFirstMatchCapability: Record<string, unknown> = {};
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
    const mergedCapabilities: Partial<Pluma.Capabilities>[] = [];

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
  static mergeCapabilities(
    primary: Record<string, unknown>,
    secondary?: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
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
  static matchCapabilities(
    capabilities: Partial<Pluma.Capabilities>,
  ): Pluma.Capabilities | null {
    const matchedCapabilities: Pluma.Capabilities = {
      browserName: 'pluma',
      browserVersion: utils.getVersion(),
      platformName: os.platform(),
      acceptInsecureCerts: false,
      setWindowRect: false,
    };

    // TODO: add extension capabilities here in the future
    let flag = true;
    const keys = Object.keys(capabilities) as Array<keyof Pluma.Capabilities>;
    keys.forEach(property => {
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
      utils.copyProperty(matchedCapabilities, capabilities, property);
    });

    if (flag) return matchedCapabilities;

    return null;
  }

  /**
   * attempts to find a [[WebElement]] from a given startNode, selection strategy and selector
   */
  elementRetrieval(
    startNode: HTMLDocument | HTMLElement,
    strategy?: string,
    selector?: string,
  ): WebElement[] {
    const endTime = new Date(new Date().getTime() + this.timeouts.implicit);
    let elements;
    const result: WebElement[] = [];

    if (!strategy || !selector) throw new InvalidArgument();
    if (!startNode) throw new NoSuchElement();

    const locationStrategies = {
      cssSelector() {
        return startNode.querySelectorAll(selector);
      },
      linkTextSelector(partial = false) {
        const linkElements = startNode.querySelectorAll('a');
        const strategyResult: HTMLElement[] = [];

        linkElements.forEach(element => {
          const renderedText = element.innerHTML;
          if (!partial && renderedText.trim() === selector)
            strategyResult.push(element);
          else if (partial && renderedText.includes(selector))
            strategyResult.push(element);
        });
        return strategyResult;
      },
      tagName() {
        return startNode.getElementsByTagName(selector);
      },
      XPathSelector(document: Document) {
        const evaluateResult = document.evaluate(selector, startNode, null, 7);
        const length = evaluateResult.snapshotLength;
        const xPathResult: HTMLElement[] = []; // according to W3C this should be a NodeList
        for (let i = 0; i < length; i++) {
          const node = evaluateResult.snapshotItem(i);
          xPathResult.push(node as HTMLElement);
        }
        return xPathResult;
      },
    };

    do {
      try {
        switch (strategy) {
          case 'css selector':
            elements = Array.from(locationStrategies.cssSelector());
            break;
          case 'link text':
            elements = locationStrategies.linkTextSelector();
            break;
          case 'partial link text':
            elements = locationStrategies.linkTextSelector(true);
            break;
          case 'tag name':
            elements = Array.from(locationStrategies.tagName());
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
    } while (endTime > new Date() && elements && elements.length < 1);

    elements?.forEach(element => {
      const foundElement = new WebElement(element as HTMLElement);
      result.push(foundElement);
      this.browser.knownElements.push(foundElement);
    });
    return result;
  }

  /**
   * Adds an HTMLElement to the array of known elements
   * @param {HTMLElement} element
   * @returns {Object} the JSON representation of the WebElement
   */
  addElementToKnownElements(element: HTMLElement): Pluma.SerializedWebElement {
    const webElement = new WebElement(element);
    this.browser.knownElements.push(webElement);
    return webElement.serialize();
  }
}

export default Session;
