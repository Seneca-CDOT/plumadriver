import { Pluma } from '../../Types/types';

export const deleteSession: Pluma.CommandHandler = async ({ session }) => {
  session.browser.close();
};
