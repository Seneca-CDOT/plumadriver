import { updateDate } from '../../time';
import Pluma from '../../Types/types';

const setTimeouts: Pluma.CommandHandler = async () => {
  updateDate();
  return null;
};

export default setTimeouts;
