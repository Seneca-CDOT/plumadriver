import { ElementNotInteractable, InvalidArgument } from '../Error/errors';
import { addFileList } from '../jsdom_extensions/addFileList';
import * as utils from '../utils/utils';
import validator from 'validator';
import has from 'has';
import { Browser } from '../Browser/Browser';

export function sendKeysToElement(
  text: string,
  elementId: string,
  browser: Browser,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const webElement = browser.getKnownElement(elementId);
    const element: HTMLElement = webElement.element;
    let files = [];
    if (text === undefined) reject(new InvalidArgument());
    if (
      !webElement.isInteractable() &&
      element.getAttribute('contenteditable') !== 'true'
    ) {
      reject(new ElementNotInteractable()); // TODO: create new error class
    }

    if (browser.getActiveElement() !== element) element.focus();

    if (element.tagName.toLowerCase() === 'input') {
      if (typeof text === 'string') reject(new InvalidArgument());
      // file input
      if (element.getAttribute('type') === 'file') {
        files = text.split('\n');
        if (files.length === 0) throw new InvalidArgument();
        if (!element.hasAttribute('multiple') && files.length !== 1)
          throw new InvalidArgument();

        await Promise.all(files.map(file => utils.fileSystem.pathExists(file)));

        addFileList(element, files);
        element.dispatchEvent(new Event('input'));
        element.dispatchEvent(new Event('change'));
      } else if (
        element.getAttribute('type') === 'text' ||
        element.getAttribute('type') === 'email'
      ) {
        (element as HTMLInputElement).value += text;
        element.dispatchEvent(new Event('input'));
        element.dispatchEvent(new Event('change'));
      } else if (element.getAttribute('type') === 'color') {
        if (!validator.isHexColor(text)) throw new InvalidArgument();
        (element as HTMLInputElement).value = text;
      } else {
        if (!has(element, 'value') || element.getAttribute('readonly'))
          throw new Error('element not interactable'); // TODO: create error class
        // TODO: add check to see if element is mutable, reject with element not interactable
        (element as HTMLInputElement).value = text;
      }
      element.dispatchEvent(new Event('input'));
      element.dispatchEvent(new Event('change'));
      resolve(null);
    } else {
      // TODO: text needs to be encoded before it is inserted into the element
      // innerHTML, especially important since js code can be inserted in here and executed
      element.innerHTML += text;
      resolve(null);
    }
  });
}
