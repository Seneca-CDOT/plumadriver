
const uuidv1 = require('uuid/v1');
const validator = require('validator');
const os = require('os');
const { Mutex } = require('async-mutex');

const Browser = require('../browser/browser.js');
const WebElement = require('../WebElement/WebElement.js');
const { COMMANDS } = require('../commands/commands');

// errors
const {
  InvalidArgument,
  SessionNotCreated,
  InternalServerError,
  NoSuchElement,
} = require('../Error/errors');

const CapabilityValidator = require('./CapabilityValidator/CapabilityValidator');

class Session {
  constructor() {
    this.id = '';
    this.timeouts = {
      implicit: 0,
      pageLoad: 30000,
      script: 30000,
    };
    this.browser = new Browser();
    this.pageLoadStrategy = 'normal';
    this.webDriverActive = true;
    this.acceptInsecureCerts = false;
    this.mutex = new Mutex();
  }

  async process(request) {
    const { command, parameters, urlVariables } = request;
    let response = null;

    return new Promise(async (resolve) => {
      switch (command) {
        case COMMANDS.DELETE_SESSION:
          await this.browser.close();
          break;
        case COMMANDS.NAVIGATE_TO:
          await this.navigateTo(parameters);
          break;
        case COMMANDS.GET_CURRENT_URL:
          response = this.browser.getURL();
          break;
        case COMMANDS.GET_TITLE:
          response = this.browser.getTitle();
          break;
        case COMMANDS.FIND_ELEMENT:
        case COMMANDS.FIND_ELEMENTS:
          response = this.elementRetrieval(
            this.browser.dom.window.document, // start node
            parameters.using, // strategy
            parameters.value, // selector
          );
          break;
        case COMMANDS.GET_ELEMENT_TEXT:
          response = this.browser
            .getKnownElement(urlVariables.elementId)
            .getText();
          break;
        case COMMANDS.FIND_ELEMENTS_FROM_ELEMENT:
        case COMMANDS.FIND_ELEMENT_FROM_ELEMENT:
          response = this.elementRetrieval(
            this.browser.getKnownElement(urlVariables.elementId),
            parameters.using,
            parameters.value,
          );
          break;
        case COMMANDS.SET_TIMEOUTS:
          break;
        case COMMANDS.GET_TIMEOUTS:
          break;
        // case 'FOO':
        //   setTimeout(() => {
        //     resolve('FINISHED FOO');
        //   }, 10000);
        //   break;
        // case 'BAR':
        //   setTimeout(() => {
        //     resolve('FINISHED BAR');
        //   }, 5000);
        //   break;
        default:
          break;
      }
      resolve(response);
    });
  }

  async navigateTo(parameters) {
    const { url } = parameters;
    if (!validator.isURL(url)) throw new InvalidArgument();
    // TODO: write code to handle user prompts
    let timer;
    const startTimer = () => {
      timer = setTimeout(() => {
        throw new Error('timeout');
      }, this.timeouts.pageLoad);
    };
    if (this.browser.getURL() !== url) {
      startTimer();
      if (await this.browser.navigateToURL(url)) clearTimeout(timer);
    } else {
      await this.browser.navigateToURL(url);
    }
  }

  setTimeouts(timeouts) {
    const capabilityValidator = new CapabilityValidator();
    let valid = true;
    Object.keys(timeouts).forEach((key) => {
      valid = capabilityValidator.validateTimeouts(key, timeouts[key]);
      if (!valid) throw new InvalidArgument();
    });


    Object.keys(timeouts).forEach((validTimeout) => {
      this.timeouts[validTimeout] = timeouts[validTimeout];
    });
  }

  getTimeouts() {
    return this.timeouts;
  }

  configureSession(requestedCapabilities) {
    this.id = uuidv1();
    const configuredCapabilities = this.configureCapabilties(requestedCapabilities);
    this.browser = new Browser();
    // TODO:  this formatting is for the server response and should be in the server code, not here.
    const body = {
      sessionId: this.id,
      capabilities: configuredCapabilities,
    };
    return body;
  }

  configureCapabilties(request) {
    const capabilities = Session.processCapabilities(request);
    if (capabilities === null) throw new InternalServerError('could not create session');

    // configure pageLoadStrategy
    this.pageLoadStrategy = 'normal';
    if (Object.prototype.hasOwnProperty.call(capabilities, 'pageLoadStrategy')
      && typeof capabilities.pageLoadStrategy === 'string') {
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

  static processCapabilities(request) {
    const command = 'POST /session';
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
    ];

    const capabiltiesRequest = Object.prototype.hasOwnProperty
      .call(request, 'capabilities');
    if (!capabiltiesRequest
      || request.capabilities.constructor !== Object
      || Object.keys(request.capabilities).length === 0) {
      throw new InvalidArgument(command);
    }
    const { capabilities } = request;


    // validate alwaysMatch capabilties
    const requiredCapabilities = {};
    if (capabilities.alwaysMatch !== undefined) {
      defaultCapabilities.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(capabilities.alwaysMatch, key)) {
          const validatedCapability = capabilityValidator
            .validate(capabilities.alwaysMatch[key], key);
          if (validatedCapability) requiredCapabilities[key] = capabilities.alwaysMatch[key];
          else {
            throw new InvalidArgument(command);
          }
        }
      });
    }

    // validate first match capabilities
    let allMatchedCapabilities = capabilities.firstMatch;
    if (allMatchedCapabilities === undefined) {
      allMatchedCapabilities = [{}];
    } else if (allMatchedCapabilities.constructor.name.toLowerCase() !== 'array'
      || allMatchedCapabilities.length === 0) {
      throw new InvalidArgument(command);
    }
    /**
     * @param {Array[Capability]} validatedFirstMatchCapabilties contains
     * a list of all the validated firstMatch capabilties requested by the client
     */
    const validatedFirstMatchCapabilties = [];

    allMatchedCapabilities.forEach((indexedFirstMatchCapability) => {
      const validatedFirstMatchCapability = {};
      Object.keys(indexedFirstMatchCapability).forEach((key) => {
        const validatedCapability = capabilityValidator
          .validate(indexedFirstMatchCapability[key], key);
        if (validatedCapability) {
          validatedFirstMatchCapability[key] = indexedFirstMatchCapability[key];
        }
      });
      validatedFirstMatchCapabilties.push(validatedFirstMatchCapability);
    });

    // attempt merging capabilities
    const mergedCapabilities = [];

    validatedFirstMatchCapabilties.forEach((firstMatch) => {
      const merged = Session.mergeCapabilities(requiredCapabilities, firstMatch);
      mergedCapabilities.push(merged);
    });

    let matchedCapabilities;
    mergedCapabilities.forEach((capabilites) => {
      matchedCapabilities = Session.matchCapabilities(capabilites);
      if (matchedCapabilities === null) throw new SessionNotCreated('Capabilities could not be matched');
    });

    return matchedCapabilities;
  }

  static mergeCapabilities(primary, secondary) {
    const result = {};
    Object.keys(primary).forEach((key) => {
      result[key] = primary[key];
    });

    if (secondary === undefined) return result;

    Object.keys(secondary).forEach((property) => {
      if (Object.prototype.hasOwnProperty.call(primary, property)) {
        throw new InvalidArgument('POST /session');
      }
      result[property] = secondary[property];
    });

    return result;
  }

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
    Object.keys(capabilties).forEach((property) => {
      switch (property) {
        case 'browserName':
        case 'platformName':
          if (capabilties[property] !== matchedCapabilities[property]) flag = false;
          break;
        case 'browserVersion':
          // TODO: change to comparison algorith once more versions are released
          if (capabilties[property] !== matchedCapabilities[property]) flag = false;
          break;
        case 'setWindowRect':
          if (capabilties[property]) throw new InvalidArgument('POST /session');
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

  elementRetrieval(startNode, strategy, selector) {
    // TODO: check if element is connected (shadow-root) https://dom.spec.whatwg.org/#connected
    // check W3C endpoint spec for details
    const endTime = new Date(new Date().getTime + this.timeouts.implicit);
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

        linkElements.forEach((element) => {
          const renderedText = element.innerHTML;
          if (!partial && renderedText.trim() === selector) strategyResult.push(element);
          else if (partial && renderedText.includes(selector)) strategyResult.push(element);
        });
        return result;
      },
      tagName() {
        return startNode.getElementsByTagName(selector);
      },
      XPathSelector() {
        // TODO: figure out how to do this...
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
            // TODO: implement w3c standard for xpath strategy
            break;
          default:
            throw new InvalidArgument();
        }
      } catch (error) {
        if (error instanceof DOMException
          || error instanceof SyntaxError
          || error instanceof XPathException
        ) throw new Error('invalid selector'); // TODO: add invalidSelector error class
        else throw new UnknownError(); // TODO: add unknown error class
      }
    } while (endTime > new Date() && elements.length < 1);

    elements.forEach((element) => {
      const foundElement = new WebElement(element);
      result.push(foundElement);
      this.browser.knownElements.push(foundElement);
    });
    return result;
  }
}

module.exports = Session;
