import Pluma from '../../Types/types';
import { updateDate } from '../../time';

const getTitle: Pluma.CommandHandler = async ({ session }) => {
  updateDate();
  return session.browser.getTitle();
};

export default getTitle;
