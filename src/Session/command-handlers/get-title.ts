import { Pluma } from '../../Types/types';

export const getTitle: Pluma.CommandHandler = async ({ session }) => {
  return session.browser.getTitle();
};
