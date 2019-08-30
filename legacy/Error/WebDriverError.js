class WebDriverError extends Error {
  constructor(message, code) {
    super(message);
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

module.exports = WebDriverError;
