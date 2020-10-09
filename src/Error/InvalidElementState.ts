import BadRequest from './BadRequest';

export default class InvalidElementState extends BadRequest {
  constructor() {
    super();
    this.message =
      'A command could not be completed because the element is in an invalid state';
    this.name = 'InvalidElementStateError';
    this.JSONCodeError = 'invalid element state';
  }
}
