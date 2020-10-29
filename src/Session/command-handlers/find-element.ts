import { NoSuchElement } from '../../Error/errors';
import { updateTimer } from '../../timer';
import Pluma from '../../Types/types';

const findElement: Pluma.CommandHandler = async ({ session, parameters }) => {
  updateTimer();
  const element = session.elementRetrieval(
    session.browser.getCurrentBrowsingContextWindow().document,
    parameters.using,
    parameters.value,
  )[0];
  if (!element) throw new NoSuchElement();
  return element;
};

export default findElement;
