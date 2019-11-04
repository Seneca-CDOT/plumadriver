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

    if (!this.isValidName(name) || !this.isValidValue(value)) {
      return false;
    }

    let isValidOptions = true;

    if (domain) {
      isValidOptions = this.isValidDomain(domain, activeDomain);
    }

    if (httpOnly) {
      isValidOptions = this.isValidHttpOnly(httpOnly);
    }

    if (secure) {
      isValidOptions = this.isValidSecure(secure);
    }

    if (expiry) {
      isValidOptions = this.isValidExpiry(expiry);
    }

    return isValidOptions;
  }
}

export default CookieValidator;
