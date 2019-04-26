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

  getTagName() {
    return this.element.tagName;
  }

  getElementAttribute(name) {
    const booleanAtrtibutes = [
      'async',
      'autocomplete',
      'autofocus',
      'autoplay',
      'border',
      'challenge',
      'checked',
      'compact',
      'contenteditable',
      'controls',
      'default',
      'defer',
      'disabled',
      'formNoValidate',
      'frameborder',
      'hidden',
      'indeterminate',
      'ismap',
      'loop',
      'multiple',
      'muted',
      'nohref',
      'noresize',
      'noshade',
      'novalidate',
      'nowrap',
      'open',
      'readonly',
      'required',
      'reversed',
      'scoped',
      'scrolling',
      'seamless',
      'selected',
      'sortable',
      'spellcheck',
      'translate',
    ]

    if (booleanAtrtibutes.includes(name)) return this.element.hasAttribute(name).toString(); 
    return this.element.getAttribute(name);
  }
}

module.exports = WebElement;
