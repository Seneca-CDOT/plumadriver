const InternalServerError = require('./InternalServerError');

class SessionNotCreated extends InternalServerError {
  constructor(message = '') {
    super(message);
    this.value.error = 'session not created';
    this.value.message = `A new session could not be created: ${message}`;
  }
}

module.exports = SessionNotCreated;
