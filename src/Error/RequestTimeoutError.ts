import { WebDriverError } from './WebDriverError';

export class RequestTimeout extends WebDriverError {
  constructor(message, command) {
    super(message, command);
    this.name = 'RequestTimeOutError';
    this.code = 408;
  }
}
