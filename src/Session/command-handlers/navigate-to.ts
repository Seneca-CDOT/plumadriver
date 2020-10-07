import validator from 'validator';
import { InvalidArgument } from '../../Error/errors';
import { Pluma } from '../../Types/types';
import { fileSystem } from '../../utils/utils';

/**
 * navigates to a specified url
 * sets timers according to session config
 */
export const navigateTo: Pluma.CommandHandler = async ({
  session,
  parameters,
}) => {
  const { url = '' } = parameters;
  let pathType: string;

  try {
    if (validator.isURL(url)) pathType = 'url';
    else if (await fileSystem.pathExists(url)) pathType = 'file';
    else throw new InvalidArgument();
  } catch (e) {
    throw new InvalidArgument();
  }

  // pageload timer
  let timer;
  const startTimer = (): void => {
    timer = setTimeout(() => {
      throw new Error('timeout'); // TODO: create timeout error class
    }, session.timeouts.pageLoad);
  };

  if (session.browser.getUrl() !== url) {
    startTimer();
    await session.browser.navigate(url, pathType);
    clearTimeout(timer);
  }
};
