
const uuidv1 = require('uuid/v1');
const os = require('os');
const Browser = require('../browser/browser.js');
// errors
const {
  InvalidArgument,
  SessionNotCreated,
  InternalServerError,
} = require('../Error/errors');
const CapabilityValidator = require('./CapabilityValidator/CapabilityValidator');

class Session {
  constructor() {
    this.id = '';
    this.timeouts = {
      implicit: 0,
      pageLoad: 30000,
      script: 3000,
    };
    this.browser = new Browser();
    this.requestQueue = [];
    this.pageLoadStrategy = 'normal';
    this.webDriverActive = false;
  }

  configureSession(requestedCapabilities) {
    this.id = uuidv1();
    const capabilities = this.configureCapabilties(requestedCapabilities);
    this.browser = new Browser();
    this.requestQueue = [];
    const body = {
      status: 0,
      sessionId: this.id,
      value: capabilities,
    };
    return body;
  }

  configureBrowser() {
    // TODO: write function that configures JSDOM based on inputs
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

    // TODO: create setTimeouts function for this. use function in endpoint
    if (Object.prototype.hasOwnProperty.call(capabilities, 'timeouts')) {
      if (Object.prototype.hasOwnProperty.call(capabilities.timeouts, 'implicit')) {
        this.timeouts.implicit = capabilities.timeouts.implicit;
      }
      if (Object.prototype.hasOwnProperty.call(capabilities.timeouts, 'script')) {
        this.timeouts.script = capabilities.timeouts.script;
      }
      if (Object.prototype.hasOwnProperty.call(capabilities.timeouts, 'pageLoad')) {
        this.timeouts.pageLoad = capabilities.timeouts.pageLoad;
      }
    }

    const configuredTimeouts = {
      implicit: this.timeouts.implicit,
      pageLoad: this.timeouts.pageLoad,
      script: this.timeouts.script,
    };

    capabilities.timeouts = configuredTimeouts;

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

    let capabilities;
    const capabiltiesRequest = Object.prototype.hasOwnProperty
      .call(request, 'capabilities');
    if (!capabiltiesRequest
      || request.capabilities.constructor !== Object
      || Object.keys(request.capabilities).length === 0) {
      throw new InvalidArgument(command);
    } else {
      capabilities = request.capabilities;
    }

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
    // TODO: start timers
    let elements;
    const result = [];
    try {
      switch (strategy) {
        case 'css selector':
          elements = startNode.querySelectorAll(selector);
          break;
        case 'link text':
          // TODO: implement w3c standard for link text strategy
          break;
        case 'partial link text':
          // TODO: implement w3c standard for partial link text strategy
          break;
        case 'tag name':
          elements = startNode.getElementsByTagName(selector);
          break;
        case 'xpath':
          // TODO: implement w3c standard for xpath strategy
          break;
        default:
          break;
      }
    } catch (error) {
      if (error instanceof DOMException
        || error instanceof SyntaxError
        || error instanceof XPathException
      ) throw new Error('invalid selector'); // TODO: add invalidSelector error class
      else throw new UnknownError(); // TODO: add unknown error class
    }

    console.log(elements);

    Object.keys(elements).forEach((element) => {
      console.log(elements[element]);
      result.push(JSON.stringify(elements[element]));
    });

    return result;
  }
}

module.exports = Session;
