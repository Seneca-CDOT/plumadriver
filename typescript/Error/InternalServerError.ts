import { WebDriverError } from './WebDriverError';

export class InternalServerError extends WebDriverError {
  constructor(message) {
    super(message, 500);
  }
}