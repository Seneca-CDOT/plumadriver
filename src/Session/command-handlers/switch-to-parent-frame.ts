import { Pluma } from '../../Types/types';

export const switchToParentFrame: Pluma.CommandHandler = async ({
  session,
}) => {
  session.browser.switchToParentFrame();
  return { value: null };
};
