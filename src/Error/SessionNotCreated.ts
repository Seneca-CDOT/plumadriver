import { InternalServerError } from './InternalServerError';

export class SessionNotCreated extends InternalServerError {
  constructor(message = '') {
    super(message);
    this.name ='SessionNotCreatedError';
    this.JSONCodeError = 'session not created';
    this.message = 'a new session could not be created';
  }
}
