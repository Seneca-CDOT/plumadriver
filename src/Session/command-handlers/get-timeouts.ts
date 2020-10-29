import { updateTimer } from '../../timer';
import Pluma from '../../Types/types';

const getTimeouts: Pluma.CommandHandler = async () => {
  updateTimer();
  return null;
};

export default getTimeouts;
