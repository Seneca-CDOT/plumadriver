import { updateDate } from '../../time';
import Pluma from '../../Types/types';

const getAllCookies: Pluma.CommandHandler = async ({ session }) => {
  updateDate();
  return session.browser.getAllCookies();
};

export default getAllCookies;
