import Pluma from '../../Types/types';

const getElementCssValue: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  if (
    session.browser.getCurrentBrowsingContextWindow().document !== XMLDocument
  ) {
    return session.browser
      .getKnownElement(urlVariables.elementId)
      .getCssValue(
        typeof urlVariables.propertyName === 'string'
          ? urlVariables.propertyName
          : undefined,
      );
  }
  return '';
};
export default getElementCssValue;
