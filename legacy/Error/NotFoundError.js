const WebDriverError = require('./WebDriverError');

class NotFoundError extends WebDriverError {
  constructor(message) {
    super(message, 404);
  }
}

module.exports = NotFoundError;
