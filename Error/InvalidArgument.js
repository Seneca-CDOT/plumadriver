const BadRequest = require('./BadRequestError');

class InvalidArgument extends BadRequest {
  constructor(message, command) {
    super(message);
    this.value.error = 'invalid argument';
    this.value.message = `The arguments passed to ${command} are either invalid or malformed`;
  }
}

module.exports = InvalidArgument;
