import { WebDriverError } from './WebDriverError';

export class MethodNotAllowed extends WebDriverError {
  constructor() {
    super(405);
    this.name = 'MethodNotAllowedError';
  }
}
