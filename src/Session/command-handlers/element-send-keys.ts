import validator from 'validator';
import { ElementNotInteractable, InvalidArgument } from '../../Error/errors';
import { addFileList } from '../../jsdom_extensions/addFileList';
import { Pluma } from '../../Types/types';
import * as utils from '../../utils/utils';
import has from 'has';

/**
 * Accepts a string and an elementId @type {string}
 * Tries to locate the element with the user provided Id and insert the specified string of text
 * sets a user defined value on a given HTML element
 * TODO: this method needs to be updated to incorporate the action Object
 */
export const elementSendKeys: Pluma.CommandHandler = async ({
  session,
  urlVariables: { elementId },
  parameters: { text },
}) => {
  const webElement = session.browser.getKnownElement(elementId);
  const element: HTMLElement = webElement.element;
  let files: string[] = [];

  if (text === undefined) throw new InvalidArgument();

  if (
    !webElement.isInteractable() &&
    element.getAttribute('contenteditable') !== 'true'
  ) {
    throw new ElementNotInteractable(); // TODO: create new error class
  }

  if (session.browser.getActiveElement() !== element) element.focus();

  if (utils.isInputElement(element)) {
    if (typeof text !== 'string') throw new InvalidArgument();
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
      element.value += text;
      element.dispatchEvent(new Event('input'));
      element.dispatchEvent(new Event('change'));
    } else if (element.getAttribute('type') === 'color') {
      if (!validator.isHexColor(text)) throw new InvalidArgument();
      element.value = text;
    } else {
      if (!has(element, 'value') || element.getAttribute('readonly'))
        throw new Error('element not interactable'); // TODO: create error class
      // TODO: add check to see if element is mutable, reject with element not interactable
      element.value = text;
    }
    element.dispatchEvent(new Event('input'));
    element.dispatchEvent(new Event('change'));
    return null;
  } else {
    // TODO: text needs to be encoded before it is inserted into the element
    // innerHTML, especially important since js code can be inserted in here and executed
    element.innerHTML += text;
    return null;
  }
};
