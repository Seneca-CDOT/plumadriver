import { updateDate } from '../../time';
import Pluma from '../../Types/types';

const getElementTagName: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  updateDate();
  return session.browser.getKnownElement(urlVariables.elementId).getTagName();
};

export default getElementTagName;
