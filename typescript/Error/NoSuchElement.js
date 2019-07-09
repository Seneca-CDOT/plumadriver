const NotFoundError = require('./NotFoundError');

class NoSuchElement extends NotFoundError {
  constructor() {
    const message = 'An element could not be located on the page using the given search parameters.';
    super(message);
    this.value.error = 'no such element';
    this.value.message = message;
  }
}

module.exports = NoSuchElement;
