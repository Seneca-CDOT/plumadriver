export class WebDriverError extends Error {
  constructor(message, code) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WebDriverError);
    }

    this.name = 'WebDriverError';
    Object.defineProperty(this, 'code', {
      value: code,
      writable: false,
      enumerable: false,
    });
    this.value = {
      stacktrace: this.stack,
    };
  }
}

