import { NoSuchWindow } from '../../Error/errors';
import { updateDate } from '../../time';
import Pluma from '../../Types/types';

const getActiveElement: Pluma.CommandHandler = async ({ session }) => {
  updateDate();
  if (!session.browser.dom.window) throw new NoSuchWindow();
  return session.addElementToKnownElements(session.browser.getActiveElement());
};

export default getActiveElement;
