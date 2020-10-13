import WebDriverError from './WebDriverError';

export default class NotFoundError extends WebDriverError {
  constructor() {
    super(404);
    this.name = 'NotFoundError';
  }
}
