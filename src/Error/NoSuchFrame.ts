import NotFoundError from './NotFoundError';

export default class NoSuchFrame extends NotFoundError {
  constructor(reason?: string) {
    super();
    this.message =
      reason ||
      'A command to switch to a frame could not be satisfied because the frame could not be found.';
    this.name = 'NoSuchFrameError';
    this.JSONCodeError = 'no such frame';
  }
}
