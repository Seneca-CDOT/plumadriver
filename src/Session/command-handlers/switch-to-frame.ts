import { Pluma } from '../../Types/types';

export const switchToFrame: Pluma.CommandHandler = async ({
  session,
  parameters,
}) => {
  session.browser.switchToFrame(parameters.id);
  return { value: null };
};
