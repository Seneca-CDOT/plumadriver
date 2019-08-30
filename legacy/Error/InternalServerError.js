const WebDriverError = require('./WebDriverError');

class InternalServerError extends WebDriverError {
  constructor(message) {
    super(message, 500);
  }
}

module.exports = InternalServerError;
