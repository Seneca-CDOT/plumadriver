import { Pluma } from '../../Types/types';

export const getElementText: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  return session.browser.getKnownElement(urlVariables.elementId).getText();
};
