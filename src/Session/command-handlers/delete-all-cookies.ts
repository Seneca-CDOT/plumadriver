import { NoSuchWindow } from '../../Error/errors';
import { updateTimer } from '../../timer';
import Pluma from '../../Types/types';

const deleteAllCookies: Pluma.CommandHandler = async ({ session }) => {
  updateTimer();
  if (!session.browser.dom.window) throw new NoSuchWindow();
  await session.browser.deleteCookies(/.*/);
};

export default deleteAllCookies;
