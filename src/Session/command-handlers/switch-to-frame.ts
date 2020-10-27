import { updateDate } from '../../time';
import Pluma from '../../Types/types';

const switchToFrame: Pluma.CommandHandler = async ({ session, parameters }) => {
  updateDate();
  session.browser.switchToFrame(parameters.id);
  return { value: null };
};

export default switchToFrame;
