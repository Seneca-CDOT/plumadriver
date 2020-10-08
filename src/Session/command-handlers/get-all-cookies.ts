import { Pluma } from '../../Types/types';

export const getAllCookies: Pluma.CommandHandler = async ({ session }) => {
  return session.browser.getAllCookies();
};
