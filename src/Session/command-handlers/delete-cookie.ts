import { NoSuchWindow } from '../../Error/errors';
import { Pluma } from '../../Types/types';

export const deleteCookie: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  if (!session.browser.dom.window) throw new NoSuchWindow();
  await session.browser.deleteCookies(
    new RegExp(`^${urlVariables.cookieName}$`),
  );
};
