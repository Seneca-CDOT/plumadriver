import { NoSuchWindow } from '../../Error/errors';
import { Pluma } from '../../Types/types';

export const elementEnabled: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  if (!session.browser.dom.window) throw new NoSuchWindow();
  const isEnabled = session.browser
    .getKnownElement(urlVariables.elementId)
    .isEnabled();
  return { value: isEnabled };
};
