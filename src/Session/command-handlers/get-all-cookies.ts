import { updateTimer } from '../../timer';
import Pluma from '../../Types/types';

const getAllCookies: Pluma.CommandHandler = async ({ session }) => {
  updateTimer();
  return session.browser.getAllCookies();
};

export default getAllCookies;
