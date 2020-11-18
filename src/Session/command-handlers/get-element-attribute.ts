import Pluma from '../../Types/types';

const getElementAttribute: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  return session.browser
    .getKnownElement(urlVariables.elementId)
    .getElementAttribute(urlVariables.attributeName);
};

export default getElementAttribute;
