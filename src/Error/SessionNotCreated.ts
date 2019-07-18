import { InternalServerError } from './InternalServerError';

export class SessionNotCreated extends InternalServerError {
  constructor(message = '') {
    super(message);
    this.name ='SessionNotCreatedError'
  }
}
