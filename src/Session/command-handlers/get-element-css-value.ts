import Pluma from '../../Types/types';

const getElementCssValue: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  if (
    session.browser.getCurrentBrowsingContextWindow().document.doctype.name !==
    'xml'
  ) {
    return session.browser
      .getKnownElement(urlVariables.elementId)
      .getCssValue(urlVariables.propertyName);
  }
  return { value: '' };
};
export default getElementCssValue;
