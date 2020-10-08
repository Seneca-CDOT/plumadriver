import { Pluma } from '../../Types/types';

export const getElementProperty: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  return session.browser
    .getKnownElement(urlVariables.elementId)
    .getProperty(urlVariables.propertyName);
};
