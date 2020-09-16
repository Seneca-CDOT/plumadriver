import { Pluma } from '../Types/types';
import { WebElement } from '../WebElement/WebElement';
import { Browser } from '../Browser/Browser';

/**
 * Adds an HTMLElement to the array of known elements
 * @param {HTMLElement} element
 * @returns {Object} the JSON representation of the WebElement
 */
export function addElementToKnownElements(
  element: HTMLElement,
  browser: Browser,
): Pluma.SerializedWebElement {
  const webElement = new WebElement(element);
  browser.knownElements.push(webElement);
  return webElement.serialize();
}
