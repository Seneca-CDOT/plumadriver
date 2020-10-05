import validator from 'validator';
import has from 'has';
import { isBoolean, isNumber, isString, validate } from '../utils/utils';
import {
  unhandledPromptBehaviorValues,
  PageLoadStrategyValues,
  TimeoutValues,
} from '../constants/constants';
import { isObject } from '../utils/utils';
//import { isObject } from '../Browser/Browser';

/**
 * Validates webdriver and jsdom capabilities before they are used to configure a given session and/or user agent
 * valid property
 */
class CapabilityValidator {
  /** set to true until a capability is deemed invalid. Prevents any further
   * validation when set to false.
   */
  valid: boolean;

  constructor() {
    this.valid = true;
  }

  /**
   * validates any given plumadriver capability
   * @param capability the capability object
   * @param capabilityName the name of the capability to be validated
   */
  validate(capability: unknown, capabilityName: string): boolean {
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
          ? PageLoadStrategyValues.guard(capability as string)
          : this.valid;

        break;
      case 'unhandledPromptBehavior':
        this.valid = typeof capability === 'string';
        this.valid = this.valid
          ? unhandledPromptBehaviorValues.guard(capability as string)
          : this.valid;
        break;
      case 'proxy':
        this.valid =
          isObject(capability) && CapabilityValidator.validateProxy(capability);
        break;
      case 'timeouts':
        this.valid =
          isObject(capability) &&
          Object.entries(capability).every(e => this.validateTimeouts(...e));
        break;
      case 'plm:plumaOptions':
        this.valid =
          isObject(capability) &&
          CapabilityValidator.validatePlumaOptions(capability);
        break;
      default:
        this.valid = false;
        break;
    }
    return this.valid;
  }

  /**
   * validates proxy for session
   */
  static validateProxy(reqProxy: Record<string, unknown>): boolean {
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

    validProxy = !validate.isEmpty(reqProxy);

    if (validProxy) {
      Object.keys(reqProxy).forEach(key => {
        const value = reqProxy[key];

        if (validProxy) {
          if (!proxyProperties.includes(key)) {
            validProxy = false;
          } else {
            switch (key) {
              case 'proxyType':
                if (value === 'pac') {
                  validProxy = has(reqProxy, 'proxyAutoConfigUrl');
                } else if (
                  value !== 'direct' &&
                  value !== 'autodetect' &&
                  value !== 'system' &&
                  value !== 'manual'
                )
                  validProxy = false;
                break;
              case 'proxyAutoConfigUrl':
                validProxy = validProxy
                  ? isString(value) && validator.isURL(value)
                  : validProxy;
                break;
              case 'ftpProxy':
              case 'httpProxy':
              case 'sslProxy':
                validProxy = reqProxy.proxyType === 'manual';
                validProxy = validProxy
                  ? isString(value) && validator.isURL(value)
                  : validProxy;

                break;
              case 'socksProxy':
                validProxy = reqProxy.proxyType === 'manual';
                validProxy = validProxy
                  ? has(reqProxy, 'socksVersion')
                  : validProxy;

                validProxy = validProxy
                  ? isString(value) && validator.isURL(value)
                  : validProxy;
                break;
              case 'socksVersion':
                validProxy = reqProxy.proxyType === 'manual';
                validProxy = validProxy
                  ? isNumber(value) &&
                    Number.isInteger(value) &&
                    value > -1 &&
                    value < 256
                  : validProxy;
                break;
              case 'noProxy':
                validProxy = value instanceof Array;
                if (validProxy) {
                  (value as string[]).forEach((url: string) => {
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
  validateTimeouts(key: string, value: unknown): boolean {
    this.valid =
      isNumber(value) &&
      TimeoutValues.guard(key) &&
      Number.isInteger(value) &&
      value >= 0
        ? true
        : false;

    return this.valid;
  }

  /**
   * Validates plumadriver specific options
   * @param options vendor (plumadriver) specific options
   */
  static validatePlumaOptions(options: Record<string, unknown>): boolean {
    let validatedOptions = true;

    const allowedOptions: Record<string, (value: unknown) => boolean> = {
      url(url): boolean {
        return isString(url) && validator.isURL(url);
      },
      referrer(referrer): boolean {
        return isString(referrer) && validator.isURL(referrer);
      },
      contentType(contentType): boolean {
        let valid;
        const validTypes = ['text/html', 'application/xml'];

        if (!isString(contentType)) return false;

        if (
          validTypes.includes(contentType) ||
          contentType.substr(contentType.length - 4) === '+xml'
        ) {
          valid = true;
        } else valid = false;

        return valid;
      },
      includeNodeLocations: isBoolean,
      storageQuota(quota): boolean {
        return Number.isInteger(quota);
      },
      runScripts: isBoolean,
      resources(resources): boolean {
        return resources === 'useable';
      },
      rejectPublicSuffixes: isBoolean,
    };

    Object.keys(options).forEach(key => {
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

export { CapabilityValidator };
