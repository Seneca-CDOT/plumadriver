import Pluma from '../../Types/types';
import { updateDate } from '../../time';

const addCookie: Pluma.CommandHandler = async ({ session, parameters }) => {
  updateDate();
  return session.browser.addCookie(parameters.cookie as Pluma.Cookie);
};

export default addCookie;
