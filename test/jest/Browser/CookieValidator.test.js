const { CookieValidator } = require('../../../build/Browser/CookieValidator');

describe('CookieValidator Class', () => {
  it('correctly validates domains', () => {
    expect(CookieValidator.isValidDomain('foo.com', 'foo.com')).toBe(true);
    expect(CookieValidator.isValidDomain('.foo.com', 'foo.com')).toBe(true);
    expect(CookieValidator.isValidDomain('.foo.ca', 'foo.com')).toBe(false);
    expect(CookieValidator.isValidDomain('.foo', 'foo.com')).toBe(false);
    expect(CookieValidator.isValidDomain('.foo.com.', 'foo.com')).toBe(false);
    expect(CookieValidator.isValidDomain('gov.on.ca', 'on.ca')).toBe(false);
    expect(CookieValidator.isValidDomain('.', 'foo.com')).toBe(false);
    expect(CookieValidator.isValidDomain('.foo.com/foo', 'foo.com')).toBe(
      false,
    );
  });
});
