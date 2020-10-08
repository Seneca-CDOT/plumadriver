import { Pluma } from '../../Types/types';

export const getElementAttribute: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  return session.browser
    .getKnownElement(urlVariables.elementId)
    .getElementAttribute(urlVariables.attributeName);
};
