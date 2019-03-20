const uuidv1 = require('uuid/v1');

const ELEMENT = 'element-6066-11e4-a52e-4f735466cecf';
class WebElement {
  constructor(element) {
    Object.defineProperties(this, {
      element: {
        value: element,
        writable: false,
        enumerable: true,
      },
      [ELEMENT]: {
        value: uuidv1(),
        writable: false,
        enumerable: true,
      },
    });
  }

  getText() {
    return this.element.innerHTML;
  }
}

module.exports = WebElement;
