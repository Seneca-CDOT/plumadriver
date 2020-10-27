import { NoSuchWindow } from '../../Error/errors';
import Pluma from '../../Types/types';
import { updateDate } from '../../time';

const elementEnabled: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  updateDate();
  if (!session.browser.dom.window) throw new NoSuchWindow();
  const isEnabled = session.browser
    .getKnownElement(urlVariables.elementId)
    .isEnabled();
  return { value: isEnabled };
};

export default elementEnabled;
