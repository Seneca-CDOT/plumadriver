import { InvalidArgument } from '../Error/errors';
import validator from 'validator';
import * as utils from '../utils/utils';
import { Browser } from '../Browser/Browser';
import { Pluma } from '../Types/types';

export async function navigateTo(
  url: string,
  browser: Browser,
  timeouts: Pluma.Timeouts,
): Promise<void> {
  let pathType: string;

  try {
    if (validator.isURL(url)) pathType = 'url';
    else if (await utils.fileSystem.pathExists(url)) pathType = 'file';
    else throw new InvalidArgument();
  } catch (e) {
    throw new InvalidArgument();
  }

  // pageload timer
  let timer;
  const startTimer = (): void => {
    timer = setTimeout(() => {
      throw new Error('timeout'); // TODO: create timeout error class
    }, timeouts.pageLoad);
  };

  if (browser.getUrl() !== url) {
    startTimer();
    await browser.navigate(url, pathType);
    clearTimeout(timer);
  }
}
