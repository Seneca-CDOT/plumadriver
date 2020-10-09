import NotFoundError from './NotFoundError';

export default class StaleElementReference extends NotFoundError {
  constructor() {
    super();
    this.message =
      'A command failed because the referenced element is no longer attached to the DOM.';
    this.name = 'StaleElementReference';
    this.JSONCodeError = 'stale element reference';
  }
}
