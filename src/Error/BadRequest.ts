import { WebDriverError } from './WebDriverError';

export class BadRequest extends WebDriverError {
  constructor() {
    super(400);
    this.name = 'BadRequestError';
  }
}
