import { NoSuchElement } from '../../Error/errors';
import { Pluma } from '../../Types/types';

export const findElementFromElement: Pluma.CommandHandler = async ({
  session,
  parameters,
  urlVariables,
}) => {
  const element = session.elementRetrieval(
    session.browser.getKnownElement(urlVariables.elementId).element,
    parameters.using,
    parameters.value,
  )[0];
  if (!element) throw new NoSuchElement();
};
