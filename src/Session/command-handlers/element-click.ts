import { NoSuchWindow } from '../../Error/errors';
import Pluma from '../../Types/types';
import { updateDate } from '../../time';

const elementClick: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  updateDate();
  if (!session.browser.dom.window) throw new NoSuchWindow();
  session.browser.getKnownElement(urlVariables.elementId).click();
  return { value: null };
};

export default elementClick;
