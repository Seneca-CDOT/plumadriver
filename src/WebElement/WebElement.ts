import uuidv1 from 'uuid/v1';
import { isFocusableAreaElement } from 'jsdom/lib/jsdom/living/helpers/focusing';
import { implSymbol } from 'jsdom/lib/jsdom/living/generated/utils';
import { ELEMENT, ElementBooleanAttributeValues } from '../constants/constants';
import { InvalidArgument, InvalidElementState } from '../Error/errors';
import {
  isInputElement,
  isMutableFormControlElement,
  isMutableElement,
} from '../utils/utils';

// TODO: find a more efficient way to import this
import { JSDOM } from 'jsdom';
const { MouseEvent, getComputedStyle } = new JSDOM().window;

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
    return isFocusableAreaElement(this.element[implSymbol]);
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
    return this.element.getAttribute('type');
  }

  /**
   * Searches for the nearest ancestor element of the WebElement's HTML element by traversing the tree in reverse order.
   * Returns the element if found, otherwise returns null if the root of the tree is reached.
   * @returns {HTMLElement | null}
   */
  findAncestor(tagName: string): HTMLElement | null {
    let { parentElement: nextParent } = this.element;

    const isMatchingOrFalsy = (): boolean =>
      !nextParent || nextParent.tagName.toLowerCase() === tagName.toLowerCase();

    while (!isMatchingOrFalsy()) {
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
    const { element } = this;
    const isOptionOrOptgroupElement = ({ tagName }: HTMLElement): boolean =>
      tagName.toLowerCase() === 'option' ||
      tagName.toLowerCase() === 'optgroup';

    if (isOptionOrOptgroupElement(element)) {
      const datalistParent: HTMLElement = this.findAncestor('datalist');
      const selectParent: HTMLElement = this.findAncestor('select');
      return datalistParent || selectParent || element;
    }

    return element;
  }

  /**
   * clicks an <option> element as outlined in the W3C specification.
   * @returns {string}
   */
  private optionElementClick(): void {
    const parentNode: HTMLElement = this.getContainer();
    const element = this.element as HTMLOptionElement;

    const fireParentNodeEvents = (): void => {
      this.dispatchMouseEvents(parentNode, [
        'mouseover',
        'mousemove',
        'mousedown',
      ]);
      parentNode.focus();
    };

    const changeSelectedness = (): void => {
      if (!element.disabled) {
        parentNode.dispatchEvent(new MouseEvent('input'));
        const previousSelectedness = element.selected;
        element.selected = parentNode.hasAttribute('multiple')
          ? !previousSelectedness
          : true;
      }
    };

    const clickParentNode = (): void => {
      this.dispatchMouseEvents(parentNode, ['mouseup', 'click']);
    };

    fireParentNodeEvents();
    changeSelectedness();
    clickParentNode();
  }

  /**
   * clicks the WebElement's HTML element.
   * @returns {string}
   */
  public click(): void {
    const { element } = this;
    const isOptionElement = ({ tagName }: HTMLElement): boolean =>
      tagName.toLowerCase() === 'option';

    const isInUploadState = (element: HTMLInputElement): boolean =>
      element.tagName.toLowerCase() === 'input' && element.type === 'file';

    if (isInUploadState(element as HTMLInputElement)) {
      throw new InvalidArgument();
    }

    if (isOptionElement(element)) {
      this.optionElementClick();
    } else if (this.getElementAttribute('disabled') !== 'true') {
      this.dispatchMouseEvents(element, [
        'mouseover',
        'mouseenter',
        'mousemove',
        'mousedown',
      ]);

      element.focus();
      this.dispatchMouseEvents(element, ['mouseup', 'click']);
    }
  }

  /**
   * dispatches a series of MouseEvents
   * @returns {undefined}
   */
  private dispatchMouseEvents(element: HTMLElement, events: string[]): void {
    events.forEach(event => {
      // prevents call stack error in jsdom when clicking label element descendants
      const bubbles =
        event === 'click' && this.findAncestor('label') ? false : true;

      element.dispatchEvent(
        new MouseEvent(event, {
          bubbles,
          cancelable: true,
          composed: true,
          which: 1,
        }),
      );
    });
  }

  /**
   * Clears a mutable element (https://www.w3.org/TR/webdriver/#dfn-mutable-element)
   * @returns {undefined}
   */
  private clearContentEditableElement(element: HTMLElement): void {
    if (element.innerHTML === '') return;
    element.focus();
    element.innerHTML = '';
    element.blur();
  }

  /**
   * Clears a resettable element (https://www.w3.org/TR/webdriver/#dfn-clear-a-resettable-element)
   * @returns {undefined}
   */
  private clearResettableElement(
    element: HTMLInputElement | HTMLTextAreaElement,
  ): void {
    let isEmpty: boolean;

    if (
      isInputElement(element) &&
      Object.prototype.hasOwnProperty.call(element, 'files')
    ) {
      isEmpty = element.files.length === 0;
    } else {
      isEmpty = element.value === '';
    }

    if (isEmpty) return;

    element.focus();
    element.value = '';
    element.blur();
  }

  /**
   * clicks the WebElement's HTML element.
   * @returns {undefined}
   */
  async clear(): Promise<void> {
    const { element } = this;

    if (isMutableFormControlElement(element)) {
      this.clearResettableElement(
        isInputElement(element)
          ? (element as HTMLInputElement)
          : (element as HTMLTextAreaElement),
      );
    } else if (isMutableElement(element)) {
      this.clearContentEditableElement(element);
    } else {
      throw new InvalidElementState();
    }
  }

  /**
   * returns the JSON representation of the WebElement
   * @returns {Object}
   */
  public serialize() {
    return { [ELEMENT]: this[ELEMENT] };
  }

  /**
   * returns true if the WebElement's HTML element is a descendant of a disabled fieldset
   * and not the descendant of that fieldset's first legend element
   * @returns {boolean}
   */
  private isDisabledFieldsetDescendant = (): boolean => {
    const fieldsetAncestor = this.findAncestor(
      'fieldset',
    ) as HTMLFieldSetElement;

    if (!fieldsetAncestor || !fieldsetAncestor.disabled) {
      return false;
    }

    const fieldsetAncestorFirstLegendChild: HTMLLegendElement = fieldsetAncestor.querySelector(
      'legend',
    );

    if (
      fieldsetAncestorFirstLegendChild &&
      this.findAncestor('legend') === fieldsetAncestorFirstLegendChild
    ) {
      return false;
    }

    return true;
  };

  /**
   * returns true if WebElement's HTML element is enabled, otherwise returns false.
   * @returns {boolean}
   */
  public isEnabled(): boolean {
    const {
      localName,
      ownerDocument: { doctype },
    } = this.element;

    if (doctype.name === 'xml') {
      return false;
    }

    if (this.isDisabledFieldsetDescendant()) {
      return false;
    }

    if (['button', 'input', 'select', 'textarea'].includes(localName)) {
      return !(this.element as HTMLFormElement).disabled;
    }

    return true;
  }

  /**
   * returns whether or not the element is displayed on the page
   * based on: https://www.w3.org/TR/webdriver1/#element-displayedness
   * @returns {boolean}
   */
  public static isDisplayed(
    element: HTMLElement,
    ignoreOpacity = false,
  ): boolean {
    const { localName, parentElement } = element;

    if (localName === 'html' || localName === 'body') {
      return true;
    }

    if (localName === 'noscript') {
      return false;
    }

    if (
      (localName === 'option' || localName === 'optgroup') &&
      element.parentElement.localName === 'select'
    ) {
      return WebElement.isDisplayed(parentElement, true);
    }

    if (isInputElement(element) && element.type === 'hidden') {
      return false;
    }

    if (localName === 'map') {
      const { name, ownerDocument } = element as HTMLMapElement;
      const imageUsingMap: HTMLElement = ownerDocument.querySelector(
        `img[usemap='#${name}']`,
      );

      if (imageUsingMap) return WebElement.isDisplayed(imageUsingMap);
    }

    const {
      visibility,
      opacity,
      display,
    }: CSSStyleDeclaration = getComputedStyle(element);

    if (!ignoreOpacity && parseFloat(opacity) === 0) {
      return false;
    }

    if (
      visibility === 'hidden' ||
      visibility === 'collapse' ||
      display === 'none'
    ) {
      return false;
    }

    if (!WebElement.isDisplayed(parentElement)) {
      return false;
    }

    return true;
  }
}

export { WebElement };
