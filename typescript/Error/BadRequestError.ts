import WebDriverError from './WebDriverError';

export class BadRequestError extends WebDriverError {
  constructor(message) {
    super(message, 400);
  }
}

