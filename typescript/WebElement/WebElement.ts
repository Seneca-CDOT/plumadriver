import uuidv1 from 'uuid/v1';
import isFocusableAreaElement from 'jsdom/lib/jsdom/living/helpers/focusing';
import jsdomUtils from 'jsdom/lib/jsdom/living/generated/utils';

import { ELEMENT, ElementBooleanAttribute } from '../constants/constants';

type ElementBooleanAttribute = typeof ElementBooleanAttribute.type;

export class WebElement {
  readonly element: HTMLElement;

  readonly [ELEMENT]: string;

  isInteractable(): boolean {
    return isFocusableAreaElement(this.element[jsdomUtils.implSymbol]);
  }

  getText(): string {
    return this.element.textContent;
  }

  getTagName(): string {
    return this.element.tagName;
  }

  constructor(element: HTMLElement) {
    this.element = element;
    this[ELEMENT] = uuidv1();
  }

  getElementAttribute(name: string):string {
    if (ElementBooleanAttribute.guard(name)) return this.element.hasAttribute(name).toString();
    return this.element.getAttribute(name);
  }
}
