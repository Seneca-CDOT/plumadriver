import Pluma from '../../Types/types';
import { updateTimer } from '../../timer';

const addCookie: Pluma.CommandHandler = async ({ session, parameters }) => {
  updateTimer();
  return session.browser.addCookie(parameters.cookie as Pluma.Cookie);
};

export default addCookie;
