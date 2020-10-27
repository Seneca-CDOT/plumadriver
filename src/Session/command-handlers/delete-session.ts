import Pluma from '../../Types/types';
import { updateDate } from '../../time';

const deleteSession: Pluma.CommandHandler = async ({ session }) => {
  updateDate();
  session.browser.close();
};

export default deleteSession;
