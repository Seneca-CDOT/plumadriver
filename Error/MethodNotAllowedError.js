class MethodNotAllowedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MethodNotAllowedError';
    this.code = 405;
  }
}

module.exports = MethodNotAllowedError;
