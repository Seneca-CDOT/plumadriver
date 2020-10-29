import { updateTimer } from '../../timer';
import Pluma from '../../Types/types';

const getElementTagName: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  updateTimer();
  return session.browser.getKnownElement(urlVariables.elementId).getTagName();
};

export default getElementTagName;
