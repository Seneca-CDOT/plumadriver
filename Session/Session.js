
const uuidv1 = require('uuid/v1');
const Browser = require('../browser/browser.js');
const { defaultRequiredCapabilities } = require('./Capabilities/defaultCapabilties');
const {BadRequest} = require('../Error/errors');
const { Capability } = require('./Capability/Capability');

class Session {
  constructor(requestedCapabilities) {
    this.id = uuidv1(); // creates RFC4122 (IEFT) UUID according to W3C standard
    this.browser = new Browser(); // TODO create default config file, pass to constructor
    this.capabilities = [];
    this.validateCapabilities(requestedCapabilities);
  }

  validateCapabilities(requestedCapabilities) {
    let capabilities;
    const capabiltiesRequest = Object.prototype.hasOwnProperty.call(requestedCapabilities, 'capabilities');
    if (!capabiltiesRequest) {
      throw new BadRequest('invalid argument');
    } else {
      capabilities = requestedCapabilities.capabilities;
    }

    const requiredCapabilities = {};
    if (capabilities.alwaysMatch !== undefined ) {
      Object.keys(defaultRequiredCapabilities).forEach((key)=> {
        if (Object.prototype.hasOwnProperty.call(capabilities.alwaysMatch,key)) {
          const capability = new Capability(capabilities.alwaysMatch[key]);
          this.capabilities.push(capability);
        }
      })
    }
  }
}

module.exports = Session;
