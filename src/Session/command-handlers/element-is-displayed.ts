import { NoSuchWindow } from '../../Error/errors';
import Pluma from '../../Types/types';
import WebElement from '../../WebElement/WebElement';
import { updateDate } from '../../time';

const elementIsDisplayed: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  updateDate();
  if (!session.browser.dom.window) throw new NoSuchWindow();
  const { element } = session.browser.getKnownElement(urlVariables.elementId);
  return { value: WebElement.isDisplayed(element) };
};

export default elementIsDisplayed;
