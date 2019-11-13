import { WebDriverError } from './WebDriverError';

export class ScriptTimeout extends WebDriverError {
  constructor() {
    super(408);
    this.name = 'ScriptTimeout';
    this.message = 'A script did not complete before its timeout expired.';
    this.JSONCodeError = 'script timeout';
  }
}
