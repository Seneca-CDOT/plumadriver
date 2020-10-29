import { updateTimer } from '../../timer';
import Pluma from '../../Types/types';

const switchToFrame: Pluma.CommandHandler = async ({ session, parameters }) => {
  updateTimer();
  session.browser.switchToFrame(parameters.id);
  return { value: null };
};

export default switchToFrame;
