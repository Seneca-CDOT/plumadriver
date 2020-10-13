import { NoSuchWindow } from '../../Error/errors';
<<<<<<< HEAD
import Pluma from '../../Types/types';

const getComputedLabel: Pluma.CommandHandler = async ({
=======
import { Pluma } from '../../Types/types';

export const getComputedLabel: Pluma.CommandHandler = async ({
>>>>>>> e1823af... feat: added Get Computed Label endpoint
  session,
  urlVariables,
}) => {
  if (!session.browser.dom.window) throw new NoSuchWindow();
  return session.browser.getKnownElement(urlVariables.elementId).getLabel();
};
<<<<<<< HEAD

export default getComputedLabel;
=======
>>>>>>> e1823af... feat: added Get Computed Label endpoint
