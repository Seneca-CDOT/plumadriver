const validator = require('validator');
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
        this.valid = util.validate.type(capability, 'string');
        break;
      case 'acceptInsecureCerts':
        this.valid = util.validate.type(capability, 'boolean');
        break;
      case 'pageLoadStrategy':
        if (typeof capability !== 'string') this.valid = false;
        else this.valid = true;

        if (
          this.valid
          && capability !== 'none'
          && capability !== 'eager'
          && capability !== 'normal'
        ) this.valid = false;

        break;
      case 'unhandledPromptBehavior':
        if (typeof capability !== 'string') this.valid = false;
        else this.valid = true;

        if (
          this.valid
          && capability !== 'dismiss'
          && capability !== 'accept'
          && capability !== 'dismiss and notify'
          && capability !== 'accept and notify'
          && capability !== 'ignore'
        ) this.valid = false;

        break;
      case 'proxy':
        if (!util.validate.type(capability, 'object')) this.valid = false;
        else this.valid = true;

        if (!this.valid || !CapabilityValidator.validateProxy(capability)) this.valid = false;
        break;
      case 'timeouts':
        if (!util.validate.type(capability, 'object')) this.valid = false;
        else this.valid = true;

        Object.keys(capability).forEach((key) => {
          if (this.valid && !this.validateTimeouts(key, capability[key])) this.valid = false;
        });
        break;
      case 'plm:plumaOptions':
        if (capability.constructor !== Object) this.valid = false;
        else this.valid = true;

        if (this.valid && !CapabilityValidator.validatePlumaOptions(capability)) this.valid = false;
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
        const validTypes = ['text/html', 'application/xml'];

        if (contentType.constructor === String) valid = true;
        else valid = false;

        if (
          validTypes.includes(contentType)
          || contentType.substr(contentType.length - 4) === '+xml'
        ) {
          valid = true;
        } else valid = false;

        return valid;
      },
      includeNodeLocations(value) {
        if (value.constructor === Boolean) return true;
        return false;
      },
      storageQuota(quota) {
        return Number.isInteger(quota);
      },
      runScripts(value) {
        return value.constructor === Boolean;
      },
      resources(resources) {
        if (resources.constructor !== String) return false;
        if (resources !== 'useable') return false;
        return true;
      },
      rejectPublicSuffixes(value) {
        return value.constructor === Boolean;
      },
    };

    Object.keys(options).forEach((key) => {
      if (!Object.keys(allowedOptions).includes(key)) validatedOptions = false;
      if (validatedOptions) {
        try {
          validatedOptions = allowedOptions[key](options[key]);
        } catch (err) {
          validatedOptions = false;
        }
      }
    });
    return validatedOptions;
  }

  validateTimeouts(key, value) {
    const timeoutTypes = ['script', 'pageLoad', 'implicit'];
    this.valid = timeoutTypes.includes(key);
    this.valid = this.valid
      ? (Number.isInteger(value) && value > 0)
      : this.valid;
    return this.valid;
  }

  static validateProxy(reqProxy) {
    const proxyProperties = [
      'proxyType',
      'proxyAutoConfigUrl',
      'ftpProxy',
      'httpProxy',
      'noProxy',
      'sslProxy',
      'socksProxy',
      'socksVersion',
    ];

    let validProxy = true;

    validProxy = !util.validate.isEmpty(reqProxy);

    if (validProxy) {
      Object.keys(reqProxy).forEach((key) => {
        if (validProxy) {
          if (!proxyProperties.includes(key)) {
            validProxy = false;
          } else {
            switch (key) {
              case 'proxyType':
                if (reqProxy[key] === 'pac') {
                  validProxy = Object.prototype.hasOwnProperty.call(reqProxy, 'proxyAutoConfigUrl');
                } else if (
                  reqProxy[key] !== 'direct'
                  && reqProxy[key] !== 'autodetect'
                  && reqProxy[key] !== 'system'
                  && reqProxy[key] !== 'manual'
                ) validProxy = false;
                break;
              case 'proxyAutoConfigUrl':
                validProxy = validProxy
                  ? validator.isURL(reqProxy[key])
                  : validProxy;
                break;
              case 'ftpProxy':
              case 'httpProxy':
              case 'sslProxy':
                validProxy = (reqProxy.proxyType === 'manual');
                validProxy = validProxy
                  ? validator.isURL(reqProxy[key])
                  : validProxy;

                break;
              case 'socksProxy':
                validProxy = (reqProxy.proxyType === 'manual');
                validProxy = validProxy
                  ? Object.prototype.hasOwnProperty.call(reqProxy, 'socksVersion')
                  : validProxy;

                validProxy = validProxy
                  ? validator.isURL(reqProxy[key])
                  : validProxy;
                break;
              case 'socksVersion':
                validProxy = (reqProxy.proxyType === 'manual');
                validProxy = validProxy
                  ? (Number.isInteger(reqProxy[key]) && reqProxy[key] > -1 && reqProxy[key] < 256)
                  : validProxy;
                break;
              case 'noProxy':
                validProxy = util.validate.type(reqProxy[key], 'array');
                if (validProxy) {
                  reqProxy[key].forEach((url) => {
                    if (validProxy) validProxy = validator.isURL(url);
                  });
                }
                break;
              default:
                validProxy = false;
            }
          }
        }
      });
    }
    return validProxy;
  }
}

module.exports = CapabilityValidator;
