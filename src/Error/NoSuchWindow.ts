import { WebDriverError } from './WebDriverError';

export class NoSuchWindow extends WebDriverError {
  constructor() {
    super(404);
    this.message =
      'A command to switch to a window could not be satisfied because the window could not be found.';
    this.name = 'NoSuchWindowError';
    this.JSONCodeError = 'no such window';
  }
}
