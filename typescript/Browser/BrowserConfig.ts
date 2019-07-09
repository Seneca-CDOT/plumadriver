import { ResourceLoader } from 'jsdom';
import { Pluma } from '../Types/types';
import { tough } from '../../jsdom_extensions/tough-cookie';
import { InvalidArgument } from '../Error/errors';

import * as Utils from '../utils/utils';

/**
 * Stores jsdom configuration based on user defined BrowserOptions object for future use
 */
export class BrowserConfig {
  readonly runScripts: Pluma.RunScripts = '';
  readonly strictSSL: boolean = true;
  readonly unhandledPromptBehaviour: Pluma.UnhandledPromptBehaviour = 'dismiss';
  readonly resourceLoader: ResourceLoader;
  readonly beforeParse: Pluma.BeforeParse;
  readonly jar;
  readonly rejectPublicSuffixes : boolean;

  constructor(options: Pluma.BrowserOptions) {
    if (!Utils.isBrowserOptions(options))
      throw new Error('Invalid jsdom options');

    Object.keys(options).forEach(option => {
      if (option === 'strictSSL' && typeof options[option] !== 'boolean')
        throw new InvalidArgument('');

      if (
        option === 'rejectPublicSuffixes' &&
        typeof options[option] !== 'boolean'
      )
        throw new InvalidArgument('');

      this[option] = options[option];
    });

    this.resourceLoader = new ResourceLoader({
      strictSSL: this.strictSSL
    });

    this.jar = new tough.CookieJar(new tough.MemoryCookieStore(), {
      looseMode: true,
      rejectPublicSuffixes:
        typeof options.rejectPublicSuffixes === 'boolean'
          ? options.rejectPublicSuffixes
          : true
    });

    switch (options.unhandledPromptBehaviour) {
      case 'accept':
        this.beforeParse = BrowserConfig.beforeParseFactory(() => true);
        break;
      case 'dismiss':
        this.beforeParse = BrowserConfig.beforeParseFactory(() => false);
        break;
      case 'dismiss and notify':
        this.beforeParse = BrowserConfig.beforeParseFactory(message => {
          console.log(message);
          return false;
        });
        break;
      case 'accept and notify':
        this.beforeParse = BrowserConfig.beforeParseFactory(message => {
          console.log(message);
          return true;
        });
        break;
      case 'ignore':
        break;
      default:
        break;
    }
  }

  static beforeParseFactory(func: Pluma.UserPrompt) {
    return window => {
      ['confirm', 'alert', 'prompt'].forEach(method => {
        window[method] = func;
      });
    };
  }
}
