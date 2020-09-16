import { ScriptTimeout } from '../Error/errors';
import { JavaScriptError } from '../Error/JavaScriptError';

/**
 * handles errors resulting from failing to execute synchronous scripts
 */
export function handleSyncScriptError({
  message,
  code,
}: NodeJS.ErrnoException): never {
  if (code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
    throw new ScriptTimeout();
  } else {
    throw new JavaScriptError(message);
  }
}
