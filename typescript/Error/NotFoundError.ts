import { WebDriverError } from './WebDriverError';

export class NotFoundError extends WebDriverError {
  constructor(message) {
    super(message, 404);
  }
}