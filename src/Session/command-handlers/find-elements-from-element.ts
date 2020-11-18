import { NoSuchElement } from '../../Error/errors';
import Pluma from '../../Types/types';

const findElementsFromElement: Pluma.CommandHandler = async ({
  session,
  parameters,
  urlVariables,
}) => {
  const elements = session.elementRetrieval(
    session.browser.getKnownElement(urlVariables.elementId).element,
    parameters.using,
    parameters.value,
  );
  if (elements.length === 0) throw new NoSuchElement();
};

export default findElementsFromElement;
