import { InternalServerError } from './InternalServerError';

export class SessionNotCreated extends InternalServerError {
  constructor(message = '') {
    super(message);
    this.value.error = 'session not created';
    this.value.message = `A new session could not be created: ${message}`;
  }
}
