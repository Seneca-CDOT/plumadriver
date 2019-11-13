import { InternalServerError } from './InternalServerError';

export class UnableToSetCookie extends InternalServerError {
  constructor(reason?: string) {
    super(reason || 'A command to set a cookie’s value could not be satisfied');
    this.name = 'UnableToSetCookie';
    this.JSONCodeError = 'unable to set cookie';
  }
}
