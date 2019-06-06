import { Pluma } from '../Types/types';

export const StringUnion = <UnionType extends string>(...values: UnionType[]) => {
    Object.freeze(values);
    const valueSet: Set<string> = new Set(values);
  
    const guard = (value: string): value is UnionType => {
      return valueSet.has(value);
    };
  
    const check = (value: string): UnionType => {
      if (!guard(value)) {
        const actual = JSON.stringify(value);
        const expected = values.map(s => JSON.stringify(s)).join(' | ');
        throw new TypeError(`Value '${actual}' is not assignable to type '${expected}'.`);
      }
      return value;
    };
  
    const unionNamespace = {guard, check, values};
    return Object.freeze(unionNamespace as typeof unionNamespace & {type: UnionType});
  };

export const isCookie = (cookie:any) : cookie is Pluma.Cookie => {
  if (!cookie.name || !cookie.value) return false;
  return true;
}

export const validateCookie = {
  name(name) {
    return name !== null && name !== undefined;
  },
  value(cookieValue) {
    return this.name(cookieValue);
  },
  domain(cookieDomain, currentURL) {
    // strip current URL of path and protocol
    let currentDomain = new URL(currentURL).hostname;

    // remove leading www if any
    if (currentDomain.search(/^www\./) > -1) currentDomain = currentDomain.replace(/^www\./, '');

    if (currentDomain === cookieDomain) return true;

    if (cookieDomain.indexOf('.') === 0) { // begins with '.'
      let cookieDomainRegEx = cookieDomain.substring(1).replace(/\./, '\\.');
      cookieDomainRegEx = new RegExp(`${cookieDomainRegEx}$`);

      if (currentDomain.search(cookieDomainRegEx) > -1) return true;
      if (cookieDomain.substring(1) === currentDomain) return true;
      return false;
    }
    return false;
  },
  secure(value) {
    return typeof value === 'boolean';
  },
  httpOnly(httpOnly) {
    return this.secure(httpOnly);
  },
  expiry(expiry) {
    return Number.isInteger(expiry);
  },
}
  
export const isBrowserOptions = (obj:any): obj is Pluma.BrowserOptions => {
  if (
    obj.runScripts === undefined
    || (obj.strictSSL === undefined)
    || obj.unhandledPromptBehaviour === undefined
  ) return false;
  return true;
}