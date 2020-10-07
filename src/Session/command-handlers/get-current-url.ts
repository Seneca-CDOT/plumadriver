import { Pluma } from '../../Types/types';

export const getCurrentUrl: Pluma.CommandHandler = async ({ session }) => {
  return session.browser.getUrl();
};
