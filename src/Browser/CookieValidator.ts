import { Pluma } from '../Types/types';
import { isBoolean, isString } from '../utils/utils';

class CookieValidator {
  static isValidName(name: string): boolean {
    return isString(name);
  }

  static isValidValue(value: string): boolean {
    return isString(value);
  }

  static isValidDomain(cookieDomain, activeDomain): boolean {
    return cookieDomain.replace(/^\./, '') === activeDomain;
  }

  static isValidSecure(secure: boolean) {
    return isBoolean(secure);
  }

  static isValidHttpOnly(httpOnly: boolean) {
    return isBoolean(httpOnly);
  }

  static isValidExpiry(expiry: number) {
    return (
      Number.isInteger(expiry) &&
      expiry >= 0 &&
      expiry <= Number.MAX_SAFE_INTEGER
    );
  }

  static isValidCookie(cookie: Pluma.Cookie, activeDomain: string): boolean {
    const { name, value, domain, httpOnly, secure, expiry } = cookie;
    return (
      this.isValidName(name) &&
      this.isValidValue(value) &&
      this.isValidDomain(domain, activeDomain) &&
      this.isValidSecure(secure) &&
      this.isValidHttpOnly(httpOnly) &&
      this.isValidExpiry(expiry)
    );
  }
}

export default CookieValidator;
