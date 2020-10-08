import { Pluma } from '../../Types/types';

export const getElementTagName: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  return session.browser.getKnownElement(urlVariables.elementId).getTagName();
};
