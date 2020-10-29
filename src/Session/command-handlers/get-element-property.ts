import { updateTimer } from '../../timer';
import Pluma from '../../Types/types';

const getElementProperty: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  updateTimer();
  return session.browser
    .getKnownElement(urlVariables.elementId)
    .getProperty(
      typeof urlVariables.propertyName === 'string'
        ? urlVariables.propertyName
        : undefined,
    );
};

export default getElementProperty;
