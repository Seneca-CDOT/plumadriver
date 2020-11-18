import Pluma from '../../Types/types';

const getElementText: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  return session.browser.getKnownElement(urlVariables.elementId).getText();
};

export default getElementText;
