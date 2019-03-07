const validator = require('validator');
const ping = require('ping');
const util = require('../../utils/utils');

class CapabilityValidator {
  constructor() {
    this.valid = true;
  }

  validate(capability, capabilityName) {
    switch (capabilityName) {
      case 'browserName':
      case 'browserVersion':
      case 'platformName':
        if (!util.validate.type(capability, 'string')) this.valid = false;
        break;
      case 'acceptInsecureCerts':
        if (!util.validate.type(capability, 'boolean')) this.valid = false;
        break;
      case 'pageLoadStrategy':
        if (!util.validate.type(capability, 'string')) this.valid = false;
        if (
          capability !== 'none'
          || capability !== 'eager'
          || capability !== 'normal') this.valid = false;
        break;
      case 'unhandledPromptBehaviour':
        if (!util.validate.type(capability, 'string')) this.valid = false;
        if (
          capability !== 'dismiss'
          || capability !== 'accept'
          || capability !== 'dismiss and notify'
          || capability !== 'accept and notify'
          || capability !== 'ignore'
        ) this.valid = false;
        break;
      case 'proxy':
        if (!util.validate.type(capability, 'object')) this.valid = false;
        if (!CapabilityValidator.validateProxy(capability)) this.valid = false;
        break;
      case 'timeouts':
        if (!CapabilityValidator.validateTimeouts(capability)) this.valid = false;
        break;
      default:
        this.valid = false;
        break;
    }
    return this.valid;
  }

  static validateTimeouts(timeouts) {
    // valid timeouts
    let validTimeouts = true;
    if (!util.validate.type(timeouts, 'object')) validTimeouts = false;
    else {
      const timeoutTypes = ['script', 'pageLoad', 'implicit'];

      // check object contains valid properties
      if (!util.validate.objectPropertiesAreInArray(timeouts, timeoutTypes)) validTimeouts = false;
      // check property values are non-zero and intgers
      Object.keys(timeouts).forEach((key) => {
        if (!Number.isInteger(timeouts[key]) || timeouts[key] < 0) validTimeouts = false;
      });
    }
    return validTimeouts;
  }

  static validateProxy(reqProxy) {
    const proxyProperties = [
      'proxyType',
      'proxyAutoConfig',
      'ftpProxy',
      'httpProxy',
      'noProxy',
      'sslproxy',
      'socksProxy',
      'socksVersion',
    ];

    let validProxy = true;

    Object.keys(reqProxy).forEach((key) => {
      if (!proxyProperties.includes(key)) {
        validProxy = false;
      } else {
        switch (key) {
          case 'proxyType':
            if (reqProxy[key] === 'pac') { // this portion of code could be written more cleanly...
              if (!Object.prototype.hasOwnProperty.call(reqProxy, 'proxyAutoConfig')) {
                validProxy = false;
              }
            } else if (
              reqProxy[key] !== 'direct'
              || reqProxy[key] !== 'autodetect'
              || reqProxy[key] !== 'system'
              || reqProxy[key] !== 'manual'
            ) validProxy = false;
            break;
          case 'proxyautoConfigUrl':
            if (!validator.isURL(reqProxy[key])) validProxy = false;
            break;
          case 'ftpProxy':
          case 'httpProxy':
          case 'sslProxy':
            if (reqProxy.proxyType === 'manual') {
              this.valid = CapabilityValidator.validateHost(reqProxy[key]);
            }
            break;
          case 'socksProxy':
            if (reqProxy.proxyType === 'manual') {
              if (!Object.prototype.hasOwnProperty.call(reqProxy, 'socksVersion')) {
                this.valid = false;
              } else {
                const validHost = CapabilityValidator.validateHost(reqProxy[key]);
                if (!validHost) this.valid = false;
              }
            }
            break;
          case 'socksVersion':
            if (!reqProxy.proxyType === 'manual'
              || !(Number.isInteger(reqProxy[key]) && reqProxy[key] > -1 && reqProxy[key] < 256)) {
              this.valid = false;
            }
            break;
          default:
            this.valid = false;
        }
      }
    });
    return validProxy;
  }

  static validateHostAndPort(host) {
    let validHost;

    ping.sys.probe(host, (isAlive) => {
      if (isAlive) validHost = true;
      else validHost = false;
    });

    return validHost;
  }
}

module.exports = CapabilityValidator;
