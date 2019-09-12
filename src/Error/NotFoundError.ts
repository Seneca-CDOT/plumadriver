import { WebDriverError } from './WebDriverError';

export class NotFoundError extends WebDriverError {
  constructor() {
    super(404);
    this.name = 'NotFoundError';
  }
}
