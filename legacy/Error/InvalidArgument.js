const BadRequest = require('./BadRequestError');

class InvalidArgument extends BadRequest {
  constructor(command) {
    const message = `The arguments passed to ${command} are either invalid or malformed`;
    super(message);
    this.value.error = 'invalid argument';
    this.value.message = message;
  }
}

module.exports = InvalidArgument;
