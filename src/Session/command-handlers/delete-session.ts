import Pluma from '../../Types/types';

const deleteSession: Pluma.CommandHandler = async ({ session }) => {
  session.browser.close();
};

export default deleteSession;
