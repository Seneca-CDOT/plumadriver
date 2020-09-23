export class WebDriverError extends Error {
  command!: string;
  code!: number;
  JSONCodeError = '';
  constructor(code) {
    super();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WebDriverError);
    }

    this.name = 'WebDriverError';
    Object.defineProperty(this, 'code', {
      value: code,
      writable: false,
      enumerable: false,
    });
  }
}
