import Pluma from '../../Types/types';

const getCurrentUrl: Pluma.CommandHandler = async ({ session }) => {
  return session.browser.getUrl();
};

export default getCurrentUrl;
