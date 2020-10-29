import { updateTimer } from '../../timer';
import Pluma from '../../Types/types';

const getElementText: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  updateTimer();
  return session.browser.getKnownElement(urlVariables.elementId).getText();
};

export default getElementText;
