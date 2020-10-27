import { NoSuchWindow } from '../../Error/errors';
import Pluma from '../../Types/types';
import { updateDate } from '../../time';

const deleteAllCookies: Pluma.CommandHandler = async ({ session }) => {
  updateDate();
  if (!session.browser.dom.window) throw new NoSuchWindow();
  await session.browser.deleteCookies(/.*/);
};

export default deleteAllCookies;
