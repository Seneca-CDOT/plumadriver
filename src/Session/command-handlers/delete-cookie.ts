import { NoSuchWindow } from '../../Error/errors';
import Pluma from '../../Types/types';
import { updateDate } from '../../time';

const deleteCookie: Pluma.CommandHandler = async ({
  session,
  urlVariables,
}) => {
  updateDate();
  if (!session.browser.dom.window) throw new NoSuchWindow();
  await session.browser.deleteCookies(
    new RegExp(`^${urlVariables.cookieName}$`),
  );
};

export default deleteCookie;
