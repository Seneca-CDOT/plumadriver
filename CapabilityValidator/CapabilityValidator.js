const validator = require('validator');
const ping = require('ping');
const util = require('../utils/utils');

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
        if (typeof capability !== 'string') this.valid = false;
        if (
          capability !== 'none'
          && capability !== 'eager'
          && capability !== 'normal') this.valid = false;
        break;
      case 'unhandledPromptBehavior':
        if (typeof capability !== 'string') this.valid = false;
        if (
          capability !== 'dismiss'
          && capability !== 'accept'
          && capability !== 'dismiss and notify'
          && capability !== 'accept and notify'
          && capability !== 'ignore'
        ) this.valid = false;
        break;
      case 'proxy':
        if (!util.validate.type(capability, 'object')) this.valid = false;
        if (!CapabilityValidator.validateProxy(capability)) this.valid = false;
        break;
      case 'timeouts':
        if (!util.validate.type(capability, 'object')) this.valid = false;
        Object.keys(capability).forEach((key) => {
          if (this.valid && !this.validateTimeouts(key, capability[key])) this.valid = false;
        });
        break;
      case 'plm:plumaOptions':
        if (capability.constructor !== Object) this.valid = false;
        if (!CapabilityValidator.validatePlumaOptions(capability)) this.valid = false;
        break;
      default:
        this.valid = false;
        break;
    }
    return this.valid;
  }

  static validatePlumaOptions(options) {
    let validatedOptions = true;

    const allowedOptions = {
      url(url) {
        return validator.isURL(url);
      },
      referrer(referrer) {
        return validator.isURL(referrer);
      },
      contentType(contentType) {
        let valid;
        const validTypes = [
          'text/html',
          'application/xml',
        ];

        if (contentType.constructor === String) valid = true;
        else valid = false;

        if (validTypes.includes(contentType) || contentType.substr(contentType.length - 4) === '+xml') {
          valid = true;
        } else valid = false;

        return valid;
      },
      includeNodeLocations(value) {
        if (value.constructor === Boolean) return true;
        return false;
      },
      storageQuota(quota) {
        return validator.isInt(quota);
      },
      runScripts(value) {
        return (value.constructor === Boolean);
      },
      resources(resources) {
        if (resources.constructor !== String) return false;
        if (resources !== 'useable') return false;
        return true;
      },
    };

    Object.keys(options).forEach((key) => {
      if (!Object.keys(allowedOptions).includes(key)) validatedOptions = false;
      if (validatedOptions) {
        validatedOptions = allowedOptions[key](options[key]);
      }
    });
    return validatedOptions;
  }

  validateTimeouts(key, value) {
    const timeoutTypes = ['script', 'pageLoad', 'implicit'];
    // check object contains valid properties
    if (!timeoutTypes.includes(key)) this.valid = false;
    // check property values are non-zero and intgers
    if (this.valid) {
      if (!Number.isInteger(value) || value < 0) this.valid = false;
    }
    return this.valid;
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
