import Pluma from '../../Types/types';
import { updateTimer } from '../../timer';

const getTitle: Pluma.CommandHandler = async ({ session }) => {
  updateTimer();
  return session.browser.getTitle();
};

export default getTitle;
