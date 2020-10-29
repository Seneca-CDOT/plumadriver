import { NoSuchElement } from '../../Error/errors';
import { updateTimer } from '../../timer';
import Pluma from '../../Types/types';

const findElements: Pluma.CommandHandler = async ({ session, parameters }) => {
  updateTimer();
  const elements = session.elementRetrieval(
    session.browser.getCurrentBrowsingContextWindow().document,
    parameters.using,
    parameters.value,
  );
  if (elements.length === 0) throw new NoSuchElement();
  return elements;
};

export default findElements;
