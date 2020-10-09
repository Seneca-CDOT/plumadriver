import NotFoundError from './NotFoundError';

export default class NoSuchElement extends NotFoundError {
  constructor() {
    super();
    this.message =
      'An element could not be located on the page using the given search parameters.';
    this.name = 'NoSuchElementError';
    this.JSONCodeError = 'no such element';
  }
}
