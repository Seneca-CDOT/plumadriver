import { updateTimer } from '../../timer';
import Pluma from '../../Types/types';

const setTimeouts: Pluma.CommandHandler = async () => {
  updateTimer();
  return null;
};

export default setTimeouts;
