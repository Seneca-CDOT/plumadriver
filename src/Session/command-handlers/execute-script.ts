import { VM } from 'vm2';
import { ELEMENT } from '../../constants/constants';
import {
  JavaScriptError,
  NoSuchWindow,
  ScriptTimeout,
} from '../../Error/errors';
import { updateDate } from '../../time';
import Pluma from '../../Types/types';
import * as utils from '../../utils/utils';

/**
 * handles errors resulting from failing to execute synchronous scripts
 */
const handleSyncScriptError = ({
  message,
  code,
}: NodeJS.ErrnoException): never => {
  if (code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
    throw new ScriptTimeout();
  } else {
    throw new JavaScriptError(message);
  }
};

/**
 * executes a user defined script within the context of the dom on a given set of user defined arguments
 */
const executeScript: Pluma.CommandHandler = async ({
  session,
  parameters: { script, args = [] },
}) => {
  updateDate();
  if (!session.browser.dom.window) throw new NoSuchWindow();

  const argumentList = args.map(arg => {
    if (utils.isJsonWebElement(arg)) {
      const { element } = session.browser.getKnownElement(arg[ELEMENT]);
      return element;
    }
    return arg;
  });

  const window = session.browser.getCurrentBrowsingContextWindow();

  const func = window
    .eval(`(function() {${script}})`)
    .bind(null, ...argumentList);

  const vm = new VM({
    timeout: session.timeouts.script,
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

  const { NodeList, HTMLCollection, HTMLElement } = window;

  if (
    vmReturnValue instanceof NodeList ||
    vmReturnValue instanceof HTMLCollection
  ) {
    vmReturnValue = Array.from(vmReturnValue);
  }

  if (Array.isArray(vmReturnValue)) {
    return vmReturnValue.map(value =>
      value instanceof HTMLElement
        ? session.addElementToKnownElements(value)
        : value,
    );
  }
  if (vmReturnValue instanceof HTMLElement) {
    return session.addElementToKnownElements(vmReturnValue);
  }

  // client will expect undefined return values to be null
  const value = await (typeof vmReturnValue === 'undefined'
    ? null
    : vmReturnValue);
  return { value };
};

export default executeScript;
