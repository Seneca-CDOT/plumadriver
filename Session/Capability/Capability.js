import { BadRequest } from '../../Error/errors';

class Capability {
  constructor(capability) {
    Capability.validate(capability);
  }

  static validate(capability) {
    const capabilityName = capability.constructor.name;
    try {
      switch (capabilityName) {
        case 'browserName':
        case 'browserVersion':
        case 'platformName':
          Capability.validateType(capability, 'string');
          Capability.setCapability(capability, capabilityName);
          break;
        case 'acceptInsecureCerts':
          Capability.validateType(capability, 'boolean');
          Capability.setCapability(capability, capabilityName);
          break;
        case 'pageLoadStrategy':
          Capability.validateType(capability, 'string');
          if (
            capability !== 'none'
            || capability !== 'eager'
            || capability !== 'normal') throw new BadRequest('invalid argument');
          Capability.setCapability(capability, capabilityName);
          break;
        case 'unhandledPromptBehaviour':
          Capability.validateType(capability, 'string');
          if (
            capability !== 'dismiss'
            || capability !== 'accept'
            || capability !== 'dismiss and notify'
            || capability !== 'accept and notify'
            || capability !== 'ignore'
          ) throw new BadRequest('invalid argument');
          Capability.setCapability(capability, capabilityName);
          break;
        case 'proxy':
          // TODO: proxy capability validation
          break;
        case 'timeouts':
          // TODO: timeouts capability validation
          break;
        default:
          break;
      }
    } catch (error) {
      throw error;
    }
  }

  static validateType(capability, type) {
    if (typeof capability !== type) throw new BadRequest('invalid argument');
  }

  static setCapability(capability, name) {
    this.name = name;
    this.type = typeof capability;
    this.value = capability;
  }
}

module.exports = Capability;
