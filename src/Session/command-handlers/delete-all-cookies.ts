import { NoSuchWindow } from '../../Error/errors';
import { Pluma } from '../../Types/types';

export const deleteAllCookies: Pluma.CommandHandler = async ({ session }) => {
  if (!session.browser.dom.window) throw new NoSuchWindow();
  await session.browser.deleteCookies(/.*/);
};
