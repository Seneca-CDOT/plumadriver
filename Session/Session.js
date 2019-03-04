
const uuidv1 = require('uuid/v1');
const os = require('os');
const Browser = require('../browser/browser.js');
const { BadRequest, InternalServerError } = require('../Error/errors');
const { CapabilityValidator } = require('./CapabilityValidator/CapabilityValidator');

class Session {
  //  TODO(Miguel) NEED TO MAKE A DECISION ABOUT KEEPING THIS DESIGN (WITH CONSTRUCTOR)
  //   constructor(requestedCapabilities) {
  //   this.id = uuidv1();
  //   this.initializeSessionCapabilties(requestedCapabilities);
  //   this.browser = new Browser();
  //   this.requestQueue = [];
  // }

  configureSession(requestedCapabilities) {   
    this.id = uuidv1();
    const capabilities = this.initializeSessionCapabilties(requestedCapabilities);
    this.browser = new Browser();
    this.requestQueue = [];
    const body = {
      sessionId: this.id,
      capabilites: capabilities,
    };
    return body;
  }

  configureBrowser() {
    // TODO: write function that configures JSDOM based on inputs
  }

  initializeSessionCapabilties(request) {
    const capabilities = Session.processCapabilities(request);
    if (capabilities === null) throw new InternalServerError('could not create session');

    // initialize pageLoadStrategy
    this.pageLoadStrategy = 'normal';
    if (Object.prototype.hasOwnProperty.call(capabilities, 'pageLoadStrategy')
      && typeof capabilities.pageLoadStrategy === 'string') {
      this.pageLoadStrategy = capabilities.pageLoadStrategy;
    } else {
      capabilities.pageLoadStrategy = 'normal';
    }

    if (Object.prototype.hasOwnProperty.call('proxy')) {
      // TODO: set JSDOM proxy address
    } else {
      capabilities.proxy = {};
    }

    if (Object.prototype.hasOwnProperty.call(capabilities, 'timeouts')) {
      if (Object.prototype.hasOwnProperty.call(capabilities.timeouts, 'implicit')) {
        this.timeouts.implicit = capabilities.timeouts.implicit;
      } else this.implicitWaitTimeout = 0;

      if (Object.prototype.hasOwnProperty.call(capabilities.timeouts, 'script')) {
        this.timeouts.script = capabilities.timeouts.script;
      } else this.timeouts.script = 30000;
    }

    const configuredTimeouts = {
      implicit: this.timeouts.implicit,
      pageLoad: this.timeouts.pageLoad,
      script: this.timeouts.script,
    };

    capabilities.timeouts = configuredTimeouts;
  }

  static processCapabilities(request) {
    const defaultCapabilities = [
      'acceptInsecureCerts',
      'browserName',
      'browserVersion',
      'platformName',
      'pageLoadStrategy',
    ];

    let capabilities;
    const capabiltiesRequest = Object.prototype.hasOwnProperty
      .call(request, 'capabilities');
    if (!capabiltiesRequest) {
      throw new BadRequest('invalid argument');
    } else {
      capabilities = request.capabilities;
    }

    // validate alwaysMatch capabilties
    const requiredCapabilities = {};
    if (capabilities.alwaysMatch !== undefined) {
      Object.keys(defaultCapabilities).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(capabilities.alwaysMatch, key)) {
          const validatedCapability = new CapabilityValidator(capabilities.alwaysMatch[key], key);
          requiredCapabilities[key] = validatedCapability;
        }
      });
    }

    // validate first match capabilities
    let allMatchedCapabilities = capabilities.firstMatch;
    if (allMatchedCapabilities === undefined) {
      allMatchedCapabilities = [{}];
    } else if (allMatchedCapabilities.constructor.name.toLowerCase() !== 'array'
      || allMatchedCapabilities.length === 0) {
      throw new BadRequest('invalid argument');
    }
    /**
     * @param {Array[Capability]} validatedFirstMatchCapabilties contains
     * a list of all the validated firstMatch capabilties requested by the client
     */
    const validatedFirstMatchCapabilties = [];

    allMatchedCapabilities.forEach((indexedFirstMatchCapability) => {
      const validatedFirstMatchCapability = {};
      Object.keys(indexedFirstMatchCapability).forEach((key) => {
        const validatedCapability = new CapabilityValidator(indexedFirstMatchCapability[key], key);
        validatedFirstMatchCapability[key] = validatedCapability;
      });
      validatedFirstMatchCapabilties.push(validatedFirstMatchCapabilties);
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
      if (matchedCapabilities === null) throw new InternalServerError('could not create session');
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
        throw new BadRequest('invalid argument');
      }
      result[property] = secondary[property];
    });

    return result;
  }

  static matchCapabilities(capabilties) {
    const matchedCapabilities = {
      browserName: 'plumadriver',
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
          if (capabilties[property]) throw new BadRequest('plumadriver is headless');
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
}

module.exports = Session;
