const { CookieValidator } = require('../../../build/Browser/CookieValidator');

describe('CookieValidator Class', () => {
  it('validates names', () => {
    expect(CookieValidator.isValidName('name')).toBe(true);
    expect(CookieValidator.isValidName(false)).toBe(false);
    expect(CookieValidator.isValidName('')).toBe(false);
  });

  it('validates values', () => {
    expect(CookieValidator.isValidValue('foo')).toBe(true);
    expect(CookieValidator.isValidValue(true)).toBe(false);
  });

  it('validates domains', () => {
    expect(CookieValidator.isValidDomain('google.com', 'google.com')).toBe(
      true,
    );
    expect(CookieValidator.isValidDomain('.google.com', 'google.com')).toBe(
      false,
    );
    expect(CookieValidator.isValidDomain('foo.co.uk', 'co.uk')).toBe(false);
  });

  it('validates expiry', () => {
    expect(CookieValidator.isValidExpiry(1573232663883)).toBe(true);
    expect(CookieValidator.isValidExpiry(new Date())).toBe(false);
    expect(CookieValidator.isValidExpiry(Number.MAX_SAFE_INTEGER + 1)).toBe(
      false,
    );
    expect(CookieValidator.isValidExpiry(-1573232663883)).toBe(false);
  });

  it('validates httpOnly', () => {
    expect(CookieValidator.isValidHttpOnly(true)).toBe(true);
    expect(CookieValidator.isValidHttpOnly('false')).toBe(false);
  });

  it('validates secure', () => {
    expect(CookieValidator.isValidHttpOnly(false)).toBe(true);
    expect(CookieValidator.isValidHttpOnly('true')).toBe(false);
  });

  it('validates cookies', () => {
    expect(
      CookieValidator.isValidCookie({
        name: 'foo',
        value: 'bar',
        httpOnly: true,
        secure: false,
        expiry: 1573232663883,
        domain: '.google.com',
      }),
      'google.com',
    ).toBe(true);

    expect(
      CookieValidator.isValidCookie({
        name: 'foo',
        value: 'bar',
      }),
      'site.co.uk',
    ).toBe(true);

    expect(
      CookieValidator.isValidCookie({
        name: 'foo',
      }),
      'site.co.uk',
    ).toBe(false);

    expect(
      CookieValidator.isValidCookie({
        name: 'foo',
        value: 'bar',
        domain: 'co.uk',
      }),
      'site.co.uk',
    ).toBe(false);
  });
});
