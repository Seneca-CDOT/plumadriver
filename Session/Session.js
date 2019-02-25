
const uuidv1 = require('uuid/v1');
const Browser = require('../browser/browser.js');
const { defaultRequiredCapabilities } = require('./Capabilities/defaultCapabilties');
const { BadRequest } = require('../Error/errors');
const { Capability } = require('./Capability/Capability');

class Session {
  constructor(requestedCapabilities) {
    this.id = uuidv1(); // creates RFC4122 (IEFT) UUID according to W3C standard
    this.browser = new Browser(); // TODO create default config file, pass to constructor
    this.capabilities = {
      requiredCapabilities: [],
      firstMatchCapabilties: [],
    }
    this.processCapabilities(requestedCapabilities);
  }

  processCapabilities(requestedCapabilities) {
    let capabilities;
    const capabiltiesRequest = Object.prototype.hasOwnProperty.call(requestedCapabilities, 'capabilities');
    if (!capabiltiesRequest) {
      throw new BadRequest('invalid argument');
    } else {
      capabilities = requestedCapabilities.capabilities;
    }

    if (capabilities.alwaysMatch !== undefined ) {
      Object.keys(defaultRequiredCapabilities).forEach((key)=> {
        if (Object.prototype.hasOwnProperty.call(capabilities.alwaysMatch, key)) {
          try {
            const capability = new Capability(capabilities.alwaysMatch[key]);
            this.capabilities.requiredCapabilities.push(capability);
          } catch (error) {
            throw error;
          }
        }
      });
    }
  }
}

module.exports = Session;
