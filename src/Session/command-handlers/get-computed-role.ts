import { NoSuchWindow } from '../../Error/errors';
import Pluma from '../../Types/types';

const getComputedRole: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  if (!session.browser.dom.window) throw new NoSuchWindow();
  return session.browser.getKnownElement(urlVariables.elementId).getRole();
};

export default getComputedRole;
