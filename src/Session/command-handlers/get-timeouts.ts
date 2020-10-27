import { updateDate } from '../../time';
import Pluma from '../../Types/types';

const getTimeouts: Pluma.CommandHandler = async () => {
  updateDate();
  return null;
};

export default getTimeouts;
