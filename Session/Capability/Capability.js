const { BadRequest } = require('../../Error/errors');
const util = require('../../utils/utils');

class Capability {
  constructor(capability) {
    this.validate(capability);
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
    const _proxy = {
      proxy,
      proxyAutoConfigUrl,
      ftpProxy,
      httpProxy,
      noProxy,
      sslProxy,
      socksProxy,
      socksVersion,
    }

    Object.keys(_proxy).forEach((key => {
      if (!Object.prototype.hasOwnProperty.call(proxy, key)) {
        throw new BadRequest('invalid argument');
      } else  {
        
      }
    }))

  }
}

module.exports = Capability;
