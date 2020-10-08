import { NoSuchWindow } from '../../Error/errors';
import { Pluma } from '../../Types/types';

export const elementClick: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  if (!session.browser.dom.window) throw new NoSuchWindow();
  session.browser.getKnownElement(urlVariables.elementId).click();
  return { value: null };
};
