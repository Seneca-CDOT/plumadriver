import { NoSuchWindow } from '../../Error/errors';
import { updateTimer } from '../../timer';
import Pluma from '../../Types/types';

const getPageSource: Pluma.CommandHandler = async ({ session }) => {
  updateTimer();
  if (!session.browser.dom.window) throw new NoSuchWindow();
  return session.browser.getPageSource();
};

export default getPageSource;
