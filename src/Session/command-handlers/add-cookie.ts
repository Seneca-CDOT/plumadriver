import { Pluma } from '../../Types/types';

export const addCookie: Pluma.CommandHandler = async ({
  session,
  parameters,
}) => {
  return session.browser.addCookie(parameters.cookie as Pluma.Cookie);
};
