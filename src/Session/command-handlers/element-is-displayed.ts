import { NoSuchWindow } from '../../Error/errors';
import { updateTimer } from '../../timer';
import Pluma from '../../Types/types';
import WebElement from '../../WebElement/WebElement';

const elementIsDisplayed: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  updateTimer();
  if (!session.browser.dom.window) throw new NoSuchWindow();
  const { element } = session.browser.getKnownElement(urlVariables.elementId);
  return { value: WebElement.isDisplayed(element) };
};

export default elementIsDisplayed;
