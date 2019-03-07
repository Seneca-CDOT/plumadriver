const WebDriverError = require('./WebDriverError');

class BadRequestError extends WebDriverError {
  constructor(message) {
    super(message, 400);
  }
}

module.exports = BadRequestError;
