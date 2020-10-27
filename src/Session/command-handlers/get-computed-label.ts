import { NoSuchWindow } from '../../Error/errors';
import { updateDate } from '../../time';
import Pluma from '../../Types/types';

const getComputedLabel: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  updateDate();
  if (!session.browser.dom.window) throw new NoSuchWindow();
  return session.browser.getKnownElement(urlVariables.elementId).getLabel();
};

export default getComputedLabel;
