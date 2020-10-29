import Pluma from '../../Types/types';
import { updateTimer } from '../../timer';

const deleteSession: Pluma.CommandHandler = async ({ session }) => {
  updateTimer();
  session.browser.close();
};

export default deleteSession;
