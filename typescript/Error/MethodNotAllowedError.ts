import { WebDriverError } from './WebDriverError';

export class MethodNotAllowed extends WebDriverError {
  constructor(message) {
    super(message, 405);
    this.name = 'MethodNotAllowedError';
  }
}
