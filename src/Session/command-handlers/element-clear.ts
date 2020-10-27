import { NoSuchWindow } from '../../Error/errors';
import { updateDate } from '../../time';
import Pluma from '../../Types/types';

const elementClear: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  updateDate();
  if (!session.browser.dom.window) throw new NoSuchWindow();
  session.browser.getKnownElement(urlVariables.elementId).clear();
  return { value: null };
};

export default elementClear;
