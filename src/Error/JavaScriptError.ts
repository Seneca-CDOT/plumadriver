import InternalServerError from './InternalServerError';

export default class JavaScriptError extends InternalServerError {
  constructor(reason?: string) {
    super();
    this.name = 'JavaScriptError';
    this.JSONCodeError = 'javascript error';
    this.message =
      reason ||
      'An error occurred while executing JavaScript supplied by the user.';
  }
}
