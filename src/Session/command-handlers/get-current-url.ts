import { updateTimer } from '../../timer';
import Pluma from '../../Types/types';

const getCurrentUrl: Pluma.CommandHandler = async ({ session }) => {
  updateTimer();
  return session.browser.getUrl();
};

export default getCurrentUrl;
