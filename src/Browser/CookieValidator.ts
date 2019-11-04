import { Pluma } from '../Types/types';
import { getDomainFromUrl } from '../utils/utils';

class CookieValidator {
  static isString(candidateValue): boolean {
    return typeof candidateValue === 'string';
  }

  static isBoolean(candidateValue): boolean {
    return typeof candidateValue === 'boolean';
  }

  static isValidName(name: string): boolean {
    return this.isString(name);
  }

  static isValidValue(value: string): boolean {
    return this.isString(value);
  }

  static isValidDomain(cookieDomain, activeDomain): boolean {
    return getDomainFromUrl(cookieDomain) === activeDomain;
  }

  static isValidSecure(secure: boolean) {
    return this.isBoolean(secure);
  }

  static isValidhttpOnly(httpOnly: boolean) {
    return this.isBoolean(httpOnly);
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
      this.isValidhttpOnly(httpOnly) &&
      this.isValidExpiry(expiry)
    );
  }
}

export default CookieValidator;
