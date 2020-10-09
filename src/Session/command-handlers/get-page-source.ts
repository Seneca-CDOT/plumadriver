import { NoSuchWindow } from '../../Error/errors';
import Pluma from '../../Types/types';

const getPageSource: Pluma.CommandHandler = async ({ session }) => {
  if (!session.browser.dom.window) throw new NoSuchWindow();
  return session.browser.getPageSource();
};

export default getPageSource;
