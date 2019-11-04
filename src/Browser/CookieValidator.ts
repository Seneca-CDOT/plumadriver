import { http } from 'winston';
import { Pluma } from '../Types/types';
import { getDomainFromUrl } from '../utils/utils';

class CookieValidator {
  isString(candidateValue: string): boolean {
    return typeof candidateValue === 'string';
  }

  isBoolean(candidateValue: boolean): boolean {
    return typeof candidateValue === 'boolean';
  }

  isValidName(name: string): boolean {
    return this.isString(name);
  }

  isValidValue(value: string): boolean {
    return this.isString(value);
  }

  isValidDomain(cookieDomain, activeDomain): boolean {
    return getDomainFromUrl(cookieDomain) === activeDomain;
  }

  isValidPath() {}

  isValidSecure(secure: boolean) {
    return this.isBoolean(secure);
  }

  isValidhttpOnly(httpOnly: boolean) {
    return this.isBoolean(httpOnly);
  }

  isValidExpiry(expiry: number) {
    return (
      Number.isInteger(expiry) &&
      expiry >= 0 &&
      expiry <= Number.MAX_SAFE_INTEGER
    );
  }

  isValidCookie(cookie: Pluma.Cookie, activeDomain: string): boolean {
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
