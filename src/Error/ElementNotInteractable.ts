import BadRequest from './BadRequest';

export default class ElementNotInteractable extends BadRequest {
  constructor() {
    super();
    this.name = 'ElementNotInteractableError';
    this.message = `${this.command} could not be completed because the element is not pointer or keyboard interactable.`;
    this.JSONCodeError = 'element not interactable';
  }
}
