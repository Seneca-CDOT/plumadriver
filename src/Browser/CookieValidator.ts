import { Pluma } from '../Types/types';

class CookieValidator {
  isString(candidate: string): boolean {
    return typeof candidate === 'string';
  }

  isValidName(name: string): boolean {
    return this.isString(name);
  }

  isValidValue(value: string): boolean {
    return this.isString(value);
  }

  isValidDomain(cookieDomain, activeUrl): boolean {
    const removeSubdomainRegExp = /^[^\.]*\./;
    return (
      cookieDomain.replace(removeSubdomainRegExp, '') ===
      activeUrl.replace(removeSubdomainRegExp, '')
    );
  }

  isValidCookie(
    { name, value, path, domain, httpOnly, secure, expiry } = {},
    activeUrl: string,
  ): boolean {
    return (
      this.isValidName(name) &&
      this.isValidValue(value) &&
      this.isValidDomain(domain, activeUrl)
    );
  }
}
