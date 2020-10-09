import InternalServerError from './InternalServerError';

export default class SessionNotCreated extends InternalServerError {
  constructor(reason?: string) {
    super();
    this.name = 'SessionNotCreatedError';
    this.JSONCodeError = 'session not created';
    this.message = reason || 'a new session could not be created';
  }
}
