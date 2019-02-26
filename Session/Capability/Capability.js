const validator = require('validator');
const { BadRequest } = require('../../Error/errors');
const util = require('../../utils/utils');

class Capability {
  constructor(capability, capabilityName) {
    this.validate(capability, capabilityName);
  }

  validate(capability, capabilityName) {
    try {
      switch (capabilityName) {
        case 'browserName':
        case 'browserVersion':
        case 'platformName':
          if (!util.validate.type(capability, 'string')) throw new BadRequest('invalid argument');
          this.setCapability(capability, capabilityName);
          break;
        case 'acceptInsecureCerts':
          if (!util.validate.type(capability, 'boolean')) throw new BadRequest('invalid argument');
          this.setCapability(capability, capabilityName);
          break;
        case 'pageLoadStrategy':
          if (!util.validate.type(capability, 'string')) throw new BadRequest('invalid argument');
          if (
            capability !== 'none'
            || capability !== 'eager'
            || capability !== 'normal') throw new BadRequest('invalid argument');
          this.setCapability(capability, capabilityName);
          break;
        case 'unhandledPromptBehaviour':
          if (!util.validate.type(capability, 'string')) throw new BadRequest('invalid argument');
          if (
            capability !== 'dismiss'
            || capability !== 'accept'
            || capability !== 'dismiss and notify'
            || capability !== 'accept and notify'
            || capability !== 'ignore'
          ) throw new BadRequest('invalid argument');
          this.setCapability(capability, capabilityName);
          break;
        case 'proxy':
          if (!util.validate.type(capability, 'object')) throw new BadRequest('invalid argument');
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

  setCapability(capability, name) {
    this.name = name;
    this.type = typeof capability;
    this.value = capability;
  }

  setTimeouts(timeouts) {

  }

  setProxy(proxy) {
    const proxyProperties = [
      'proxyType',
      'proxyAutoConfig',
      'ftpProxy',
      'httpProxy',
      'noProxy',
      'sslproxy',
      'socksProxy',
      'socksVersion'
    ];

    const _proxy = {};

    proxyProperties.forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(proxy, key)) {
        throw new BadRequest('invalid argument');
      } else {
        switch (key) {
          case 'proxyType':
            if (proxy[key] === 'pac') {
              if (!Object.prototype.hasOwnProperty.call(proxy, 'proxyAutoConfig')) {
                throw new BadRequest('invalid argument');
              }
              _proxy[key] = proxy[key];
            } else if (
              proxy[key] !== 'direct'
              || proxy[key] !== 'autodetect'
              || proxy[key] !== 'system'
              || proxy[key] !== 'manual'
            ) throw new BadRequest('invalid argument');
            else {
              _proxy[key] = proxy[key];
            }
            break;
          case 'proxyautoConfigUrl':
          if (!validator.isURL(proxy[key])) throw new BadRequest('invalid argument');
            break;
          default:
            break;
        }
      }
    });
    return this; // change
  }
}

module.exports = Capability;
