import { Pluma } from '../Types/types';
import { isBoolean, isString, getDomainFromUrl } from '../utils/utils';

class CookieValidator {
  static isValidName(name: string): boolean {
    return isString(name);
  }

  static isValidValue(value: string): boolean {
    return isString(value);
  }

  static isValidDomain(cookieDomain: string, activeDomain: string): boolean {
    return (
      cookieDomain === undefined ||
      getDomainFromUrl(cookieDomain) === activeDomain
    );
  }

  static isValidSecure(secure: boolean) {
    return secure === undefined || isBoolean(secure);
  }

  static isValidHttpOnly(httpOnly: boolean) {
    return httpOnly === undefined || isBoolean(httpOnly);
  }

  static isValidExpiry(expiry: number) {
    return (
      expiry === undefined ||
      (Number.isInteger(expiry) &&
        expiry >= 0 &&
        expiry <= Number.MAX_SAFE_INTEGER)
    );
  }

  static isValidCookie(cookie: Pluma.Cookie, activeDomain: string): boolean {
    const { name, value, domain, httpOnly, secure, expiry } = cookie;

    if (!this.isValidName(name) || !this.isValidValue(value)) {
      return false;
    }

    return (
      this.isValidDomain(domain, activeDomain) &&
      this.isValidHttpOnly(httpOnly) &&
      this.isValidSecure(secure) &&
      this.isValidExpiry(expiry)
    );
  }
}

export default CookieValidator;
