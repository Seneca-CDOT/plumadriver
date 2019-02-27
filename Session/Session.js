
const uuidv1 = require('uuid/v1');
const Browser = require('../browser/browser.js');
const { BadRequest, InternalServerError } = require('../Error/errors');
const { Capability } = require('./Capability/Capability');

class Session {
  constructor(requestedCapabilities) {
    if (Session.processCapabilities(requestedCapabilities) === null) {
      throw new InternalServerError('session not created');
    }
    this.id = uuidv1(); // creates RFC4122 (IEFT) UUID according to W3C standard
    this.browser = new Browser(); // TODO create default config file, pass to constructor
    this.capabilities = {
      requiredCapabilities: [],
      firstMatchCapabilties: [],
    };
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
    } else if (allMatchedCapabilities.constructor.name.toLowerCase() !== 'array'
      || allMatchedCapabilities.length === 0) {
      throw new BadRequest('invalid argument');
    }

    const validatedFirstMatchCapabilties = [];

    allMatchedCapabilities.forEach((capabilityName) => {
      const validatedCapability = new Capability(
        allMatchedCapabilities[capabilityName],
        capabilityName,
      );
      validatedFirstMatchCapabilties.push(validatedCapability);
    });

    // attempt mergin capabilities
    const mergedCapabilities = Capability.mergeCapabilities(requiredCapabilities, firstMatchCapabilities);
  }

  static mergeCapabilities(primary, secondary) {
    const result = {};

    Object.keys(primary).forEach((key) => {
      result[key] = primary[key];
    });

    if (secondary === undefined) return result;


    return result;
  }
}

module.exports = Session;
