import { updateDate } from '../../time';
import Pluma from '../../Types/types';

const switchToParentFrame: Pluma.CommandHandler = async ({ session }) => {
  updateDate();
  session.browser.switchToParentFrame();
  return { value: null };
};

export default switchToParentFrame;
