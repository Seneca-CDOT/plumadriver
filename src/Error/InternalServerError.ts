import { WebDriverError } from './WebDriverError';

export class InternalServerError extends WebDriverError {
  constructor() {
    super(500);
    this.name = 'InternalServerError';
  }
}
