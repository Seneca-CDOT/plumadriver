import { WebDriverError } from './WebDriverError';

export class BadRequest extends WebDriverError {
  constructor(message) {
    super(message, 400);
  }
}
