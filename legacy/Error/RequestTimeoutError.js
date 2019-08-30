class RequestTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RequestTimeOutError';
    this.code = 408;
  }
}

module.exports = RequestTimeoutError;
