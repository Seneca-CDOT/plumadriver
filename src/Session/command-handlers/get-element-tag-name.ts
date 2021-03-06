import Pluma from '../../Types/types';

const getElementTagName: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  return session.browser.getKnownElement(urlVariables.elementId).getTagName();
};

export default getElementTagName;
