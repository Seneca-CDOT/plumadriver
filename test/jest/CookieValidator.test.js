const { default: CookieValidator } = require('../../build/Browser/CookieValidator');

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
    ).toBe(true);

    expect(
      CookieValidator.isValidCookie({
        name: 'foo',
        value: 'bar',
      }),
    ).toBe(true);

    expect(
      CookieValidator.isValidCookie({
        name: 'foo',
      }),
    ).toBe(false);

    expect(
      CookieValidator.isValidCookie({
        name: 'foo',
        value: 1,
      }),
    ).toBe(false);
  });
});
