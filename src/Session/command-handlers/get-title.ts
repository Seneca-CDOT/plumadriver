import Pluma from '../../Types/types';

const getTitle: Pluma.CommandHandler = async ({ session }) => {
  return session.browser.getTitle();
};

export default getTitle;
