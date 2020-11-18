import Pluma from '../../Types/types';

const getAllCookies: Pluma.CommandHandler = async ({ session }) => {
  return session.browser.getAllCookies();
};

export default getAllCookies;
