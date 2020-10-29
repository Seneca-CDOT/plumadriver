import { NoSuchWindow } from '../../Error/errors';
import { updateTimer } from '../../timer';
import Pluma from '../../Types/types';

const elementEnabled: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  updateTimer();
  if (!session.browser.dom.window) throw new NoSuchWindow();
  const isEnabled = session.browser
    .getKnownElement(urlVariables.elementId)
    .isEnabled();
  return { value: isEnabled };
};

export default elementEnabled;
