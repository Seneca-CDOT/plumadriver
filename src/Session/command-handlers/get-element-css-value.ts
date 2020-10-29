import { updateTimer } from '../../timer';
import Pluma from '../../Types/types';

const getElementCssValue: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  updateTimer();
  if (
    session.browser.getCurrentBrowsingContextWindow().document.doctype.name !==
    'xml'
  ) {
    return session.browser
      .getKnownElement(urlVariables.elementId)
      .getCssValue(urlVariables.propertyName);
  }
  return { value: '' };
};
export default getElementCssValue;
