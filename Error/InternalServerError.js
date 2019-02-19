class InternalServerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InternalServerError';
    this.code = 500;
  }
}

module.exports = InternalServerError;
