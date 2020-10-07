import { NoSuchElement } from '../../Error/errors';
import { Pluma } from '../../Types/types';

export const findElement: Pluma.CommandHandler = async ({
  session,
  parameters,
}) => {
  const element = session.elementRetrieval(
    session.browser.getCurrentBrowsingContextWindow().document,
    parameters.using,
    parameters.value,
  )[0];
  if (!element) throw new NoSuchElement();
  return element;
};
