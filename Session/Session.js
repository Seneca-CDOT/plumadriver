
const uuidv1 = require('uuid/v1');
const Browser = require('../browser/browser.js');
const { BadRequest } = require('../Error/errors');
const { Capability } = require('./Capability/Capability');

class Session {
  constructor(requestedCapabilities) {
    this.processCapabilities(requestedCapabilities);
    this.id = uuidv1(); // creates RFC4122 (IEFT) UUID according to W3C standard
    this.browser = new Browser(); // TODO create default config file, pass to constructor
    this.capabilities = {
      requiredCapabilities: [],
      firstMatchCapabilties: [],
    };
  }

  processCapabilities(request) {
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

    // alwaysMatch capabilties
    const requiredCapabilities = {};
    if (capabilities.alwaysMatch !== undefined) {
      Object.keys(defaultCapabilities).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(capabilities.alwaysMatch, key)) {
          const validatedCapability = new Capability(capabilities.alwaysMatch[key], key);
          requiredCapabilities[key] = validatedCapability;
        }
      });
    }

    // first match capabilities
    let allMatchedCapabilities = capabilities.firstMatch;
    if (allMatchedCapabilities === undefined) {
      allMatchedCapabilities = [{}];
    } else if (allMatchedCapabilities.constructor.name.toLowerCase() !== 'array' || allMatchedCapabilities.length === 0) {
      throw new BadRequest('invalid argument');
    }

    const validatedFirstMatchCapabilties = [];
    
    allMatchedCapabilities.forEach((capabilityName) => {
      try {
        const validatedCapability = new Capability(); // TODO: add parameters.

      } catch (error) {
        throw error;
      }
    });



    return this; // change, here so eslint is not so annoying
  }
}

module.exports = Session;
