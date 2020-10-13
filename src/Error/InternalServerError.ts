import WebDriverError from './WebDriverError';

export default class InternalServerError extends WebDriverError {
  constructor() {
    super(500);
    this.name = 'InternalServerError';
  }
}
