import { NoSuchElement } from '../../Error/errors';
import { updateDate } from '../../time';
import Pluma from '../../Types/types';

const findElement: Pluma.CommandHandler = async ({ session, parameters }) => {
  updateDate();
  const element = session.elementRetrieval(
    session.browser.getCurrentBrowsingContextWindow().document,
    parameters.using,
    parameters.value,
  )[0];
  if (!element) throw new NoSuchElement();
  return element;
};

export default findElement;
