import { InternalServerError } from './InternalServerError';

export class UnableToSetCookie extends InternalServerError {
  constructor(reason?: string) {
    super(
      `A command to set a cookie’s value could not be satisfied${
        reason ? ` :${reason}` : '.'
      }`,
    );

    this.name = 'UnableToSetCookie';
    this.JSONCodeError = 'unable to set cookie';
  }
}
