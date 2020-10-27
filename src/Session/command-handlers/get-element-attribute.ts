import { updateDate } from '../../time';
import Pluma from '../../Types/types';

const getElementAttribute: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  updateDate();
  return session.browser
    .getKnownElement(urlVariables.elementId)
    .getElementAttribute(urlVariables.attributeName);
};

export default getElementAttribute;
