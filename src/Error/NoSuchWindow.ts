import NotFoundError from './NotFoundError';

export default class NoSuchWindow extends NotFoundError {
  constructor() {
    super();
    this.message =
      'A command to switch to a window could not be satisfied because the window could not be found.';
    this.name = 'NoSuchWindowError';
    this.JSONCodeError = 'no such window';
  }
}
