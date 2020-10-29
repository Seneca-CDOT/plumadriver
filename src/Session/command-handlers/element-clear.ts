import { NoSuchWindow } from '../../Error/errors';
import { updateTimer } from '../../timer';
import Pluma from '../../Types/types';

const elementClear: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  updateTimer();
  if (!session.browser.dom.window) throw new NoSuchWindow();
  session.browser.getKnownElement(urlVariables.elementId).clear();
  return { value: null };
};

export default elementClear;
