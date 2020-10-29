import { updateTimer } from '../../timer';
import Pluma from '../../Types/types';

const switchToParentFrame: Pluma.CommandHandler = async ({ session }) => {
  updateTimer();
  session.browser.switchToParentFrame();
  return { value: null };
};

export default switchToParentFrame;
