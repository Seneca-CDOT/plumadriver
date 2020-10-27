import { updateDate } from '../../time';
import Pluma from '../../Types/types';

const getCurrentUrl: Pluma.CommandHandler = async ({ session }) => {
  updateDate();
  return session.browser.getUrl();
};

export default getCurrentUrl;
