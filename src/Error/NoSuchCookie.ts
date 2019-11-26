import { NotFoundError } from './NotFoundError';

export class NoSuchCookie extends NotFoundError {
  constructor() {
    super();
    this.message =
      'No cookie matching the given path name was found amongst the associated cookies of the current browsing context’s active document.';
    this.name = 'NoSuchCookieError';
    this.JSONCodeError = 'no such cookie';
  }
}
