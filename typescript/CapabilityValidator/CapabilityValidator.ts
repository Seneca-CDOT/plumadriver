import validator from 'validator';
import { validate } from '../utils/utils';
import {
  UnhandledPromptBehaviourValues,
  PageLoadStrategyValues,
  TimeoutValues,
} from '../constants/constants';

export class CapabilityValidator {
  valid: boolean;

  constructor() {
    this.valid = true;
  }

  /**
   * validates any given plumadriver capability
   * @param capability the capability object
   * @param capabilityName the name of the capability to be validated
   */
  validate(capability, capabilityName) {
    switch (capabilityName) {
      case 'browserName':
      case 'browserVersion':
      case 'platformName':
        this.valid = typeof capability === 'string';
        break;
      case 'acceptInsecureCerts':
        this.valid = typeof capability === 'boolean';
        break;
      case 'pageLoadStrategy':
        this.valid = typeof capability === 'string';
        this.valid = this.valid
          ? PageLoadStrategyValues.guard(capability)
          : this.valid;

        break;
      case 'unhandledPromptBehavior':
        this.valid = typeof capability === 'string';
        this.valid = this.valid
          ? UnhandledPromptBehaviourValues.guard(capability)
          : this.valid;
        break;
      case 'proxy':
        this.valid = capability.constructor === Object;

        if (!this.valid || !CapabilityValidator.validateProxy(capability))
          this.valid = false;
        break;
      case 'timeouts':
        this.valid = capability.constructor === Object;

        Object.keys(capability).forEach(key => {
          if (this.valid && !this.validateTimeouts(key, capability[key]))
            this.valid = false;
        });
        break;
      case 'plm:plumaOptions':
        this.valid = capability.constructor === Object;

        if (this.valid && !CapabilityValidator.validatePlumaOptions(capability))
          this.valid = false;
        break;
      default:
        this.valid = false;
        break;
    }
    return this.valid;
  }

  /**
   * validates proxy for session
   * @param reqProxy the proxy to be valdiated
   */
  static validateProxy(reqProxy) {
    const proxyProperties = [
      'proxyType',
      'proxyAutoConfigUrl',
      'ftpProxy',
      'httpProxy',
      'noProxy',
      'sslProxy',
      'socksProxy',
      'socksVersion'
    ];

    let validProxy = true;

    validProxy = !validate.isEmpty(reqProxy);

    if (validProxy) {
      Object.keys(reqProxy).forEach(key => {
        if (validProxy) {
          if (!proxyProperties.includes(key)) {
            validProxy = false;
          } else {
            switch (key) {
              case 'proxyType':
                if (reqProxy[key] === 'pac') {
                  validProxy = Object.prototype.hasOwnProperty.call(
                    reqProxy,
                    'proxyAutoConfigUrl'
                  );
                } else if (
                  reqProxy[key] !== 'direct' &&
                  reqProxy[key] !== 'autodetect' &&
                  reqProxy[key] !== 'system' &&
                  reqProxy[key] !== 'manual'
                )
                  validProxy = false;
                break;
              case 'proxyAutoConfigUrl':
                validProxy = validProxy
                  ? validator.isURL(reqProxy[key])
                  : validProxy;
                break;
              case 'ftpProxy':
              case 'httpProxy':
              case 'sslProxy':
                validProxy = reqProxy.proxyType === 'manual';
                validProxy = validProxy
                  ? validator.isURL(reqProxy[key])
                  : validProxy;

                break;
              case 'socksProxy':
                validProxy = reqProxy.proxyType === 'manual';
                validProxy = validProxy
                  ? Object.prototype.hasOwnProperty.call(
                      reqProxy,
                      'socksVersion'
                    )
                  : validProxy;

                validProxy = validProxy
                  ? validator.isURL(reqProxy[key])
                  : validProxy;
                break;
              case 'socksVersion':
                validProxy = reqProxy.proxyType === 'manual';
                validProxy = validProxy
                  ? Number.isInteger(reqProxy[key]) &&
                    reqProxy[key] > -1 &&
                    reqProxy[key] < 256
                  : validProxy;
                break;
              case 'noProxy':
                validProxy = reqProxy[key] instanceof Array
                if (validProxy) {
                  reqProxy[key].forEach(url => {
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

  /**
   * validates timeouts based on their type
   * @param key the type of timeout to validate
   * @param value the value of the given timeout
   */
  validateTimeouts(key, value) :boolean {
    this.valid = TimeoutValues.guard(key);
    this.valid = this.valid
      ? (Number.isInteger(value) && value > 0)
      : this.valid;
    return this.valid;
  }

  /**
   * Validates plumadriver specific options 
   * @param options vendor (plumadriver) specific options 
   */
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
        return value.constructor === Boolean;
      },
      storageQuota(quota) {
        return Number.isInteger(quota);
      },
      runScripts(value) {
        return value.constructor === Boolean;
      },
      resources(resources) {
        return (resources.constructor === String && resources === 'useable');
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
}
