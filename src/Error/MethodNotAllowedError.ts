import WebDriverError from './WebDriverError';

export default class MethodNotAllowed extends WebDriverError {
  constructor() {
    super(405);
    this.name = 'MethodNotAllowedError';
  }
}
