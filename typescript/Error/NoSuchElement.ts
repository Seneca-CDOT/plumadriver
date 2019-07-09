import { NotFoundError } from './NotFoundError';

export class NoSuchElement extends NotFoundError {
  constructor() {
    const message =
      'An element could not be located on the page using the given search parameters.';
    super(message);

  }
}
