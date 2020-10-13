import WebDriverError from './WebDriverError';

export default class BadRequest extends WebDriverError {
  constructor() {
    super(400);
    this.name = 'BadRequestError';
  }
}
