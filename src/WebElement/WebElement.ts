import * as uuidv1 from 'uuid/v1';
import isFocusableAreaElement from 'jsdom/lib/jsdom/living/helpers/focusing';
import jsdomUtils from 'jsdom/lib/jsdom/living/generated/utils';
import { ELEMENT, ElementBooleanAttributeValues } from '../constants/constants';
import { dispatchEvents } from '../utils/utils';

class WebElement {
  readonly element: HTMLElement;
  readonly [ELEMENT]: string;

  constructor(element: HTMLElement) {
    this.element = element;
    this[ELEMENT] = uuidv1();
  }
  /**
   * Wrapper for the jsdom isFocusableAreaElement method
   */
  isInteractable(): boolean {
    return isFocusableAreaElement(this.element[jsdomUtils.implSymbol]);
  }

  /**
   * returns the textContent of the WebElement's HTML element
   * @returns {String}
   */
  getText(): string {
    return this.element.textContent;
  }

  /**
   * returns the tagName of the WebElement's HTML element
   * @returns {String}
   */
  getTagName(): string {
    return this.element.tagName;
  }

  /**
   * returns 'true' @type {String} or null if @param name is an ElementBooleanAttribute
   * otherwise returns the result of getting an element attribute with name @param name
   * @param name the name of the element attribute
   * @returns {String | null}
   */
  getElementAttribute(name: string): string {
    if (ElementBooleanAttributeValues.guard(name))
      return this.element.hasAttribute(name).toString(); // returns 'true' (string) or null
    return this.element.getAttribute(name);
  }

  /**
   * returns the type attribute of the WebElement's HTML element
   * @returns {String}
   */
  getType(): string {
    const ATTRIBUTE_NAME = 'type';
    return this.element.getAttribute(ATTRIBUTE_NAME);
  }

  /**
   * Searches for a parent node of the WebElement's HTML element by traversing the tree in reverse order.
   * Returns the parent element if found, otherwise returns null if the root of the tree is reached.
   * @returns {HTMLElement | null}
   */
  findParent(tagName: string): HTMLElement | null {
    let { parentElement: nextParent } = this.element;

    const isMatchingOrIsFalsy = (): boolean => {
      return (
        !nextParent ||
        nextParent.tagName.toLowerCase() === tagName.toLowerCase()
      );
    };

    while (!isMatchingOrIsFalsy()) {
      const { parentElement } = nextParent;
      nextParent = parentElement;
    }

    return nextParent;
  }

  /**
   * returns the container of the WebElement's HTML element
   * @returns {string}
   */
  getContainer(): HTMLElement {
    const tagName = this.getTagName();
    const OPTION_ELEMENTS: string[] = ['OPTION', 'OPTGROUP'];

    if (OPTION_ELEMENTS.includes(tagName.toUpperCase())) {
      const datalistParent: HTMLElement = this.findParent('datalist');
      const selectParent: HTMLElement = this.findParent('select');
      return datalistParent || selectParent || this.element;
    }

    return this.element;
  }

  /**
   * clicks an <option> or <optgroup> element as outlined in the W3C specification.
   * @returns {string}
   */
  optionElementClick(): void {
    const parentNode: HTMLElement = this.getContainer();
    const element = this.element as HTMLOptionElement;

    const fireParentNodeEvents = (): void => {
      dispatchEvents(parentNode, ['mouseover', 'mousemove', 'mousedown']);
      parentNode.focus();
    };

    const changeSelectedness = (): void => {
      if (!element.disabled) {
        parentNode.dispatchEvent(new Event('input'));
        const previousSelectedness = element.selected;
        element.selected = parentNode.hasAttribute('multiple')
          ? !previousSelectedness
          : true;
      }
    };

    const clickParentNode = (): void => {
      dispatchEvents(parentNode, ['mouseup', 'click']);
    };

    fireParentNodeEvents();
    changeSelectedness();
    clickParentNode();
  }

  /**
   * clicks the WebElement's HTML element.
   * @returns {string}
   */
  click(): void {
    const { element } = this;
    const isOptionOrOptGroupElement = ({ tagName }: HTMLElement): boolean =>
      tagName === 'option' || tagName === 'optgroup';

    if (isOptionOrOptGroupElement(element)) {
      this.optionElementClick();
    } else {
      dispatchEvents(element, ['mouseover', 'mousedown', 'mouseup', 'click']);
    }
  }
}

export { WebElement };
