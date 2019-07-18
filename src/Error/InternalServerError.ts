import { WebDriverError } from './WebDriverError';

export class InternalServerError extends WebDriverError {
  constructor(message) {
    super(500);
    this.name = 'InternalServerError';
  }
}