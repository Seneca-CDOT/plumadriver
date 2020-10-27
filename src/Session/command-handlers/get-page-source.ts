import { NoSuchWindow } from '../../Error/errors';
import { updateDate } from '../../time';
import Pluma from '../../Types/types';

const getPageSource: Pluma.CommandHandler = async ({ session }) => {
  updateDate();
  if (!session.browser.dom.window) throw new NoSuchWindow();
  return session.browser.getPageSource();
};

export default getPageSource;
