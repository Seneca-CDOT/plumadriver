import Pluma from '../../Types/types';

const switchToParentFrame: Pluma.CommandHandler = async ({ session }) => {
  session.browser.switchToParentFrame();
  return { value: null };
};

export default switchToParentFrame;
