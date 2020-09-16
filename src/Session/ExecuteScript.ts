import { ELEMENT } from '../constants/constants';
import { VM } from 'vm2';
import { Browser } from '../Browser/Browser';
import { addElementToKnownElements } from './AddToKnownElements';
import { Pluma } from '../Types/types';
import { handleSyncScriptError } from './HandleSyncScriptError';

/**
 * executes a user defined script within the context of the dom on a given set of user defined arguments
 */
export function executeScript(
  script: string,
  args: unknown[],
  browser: Browser,
  timeouts: Pluma.Timeouts,
): unknown {
  const argumentList = args.map(arg => {
    if (arg[ELEMENT] == null) {
      return arg;
    } else {
      const { element } = browser.getKnownElement(arg[ELEMENT]);
      return element;
    }
  });

  const window = browser.getCurrentBrowsingContextWindow();

  const func = window
    .eval(`(function() {${script}})`)
    .bind(null, ...argumentList);

  const vm = new VM({
    timeout: timeouts.script,
    sandbox: {
      func,
    },
  });

  let vmReturnValue;

  try {
    vmReturnValue = vm.run('func();');
  } catch (error) {
    handleSyncScriptError(error);
  }

  // TODO: incorporate @types/jsdom to resolve typescript instanceof errors
  // eslint-disable-next-line
    const { NodeList, HTMLCollection, HTMLElement } = window as any;

  if (
    vmReturnValue instanceof NodeList ||
    vmReturnValue instanceof HTMLCollection
  ) {
    vmReturnValue = Array.from(vmReturnValue);
  }

  if (Array.isArray(vmReturnValue)) {
    return vmReturnValue.map(value =>
      value instanceof HTMLElement
        ? addElementToKnownElements(value, browser)
        : value,
    );
  } else if (vmReturnValue instanceof HTMLElement) {
    return addElementToKnownElements(vmReturnValue, browser);
  }

  // client will expect undefined return values to be null
  return typeof vmReturnValue === 'undefined' ? null : vmReturnValue;
}
