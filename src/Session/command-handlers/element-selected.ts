import { NoSuchWindow } from '../../Error/errors';
import Pluma from '../../Types/types';

const elementSelected: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  if (!session.browser.dom.window) throw new NoSuchWindow();
  const isEnabled = session.browser
    .getKnownElement(urlVariables.elementId)
    .isSelected();
  return { value: isEnabled };
};

export default elementSelected;
