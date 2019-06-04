import { ResourceLoader } from 'jsdom';
import {
  RunScripts,
  UnhandledPromptBehaviour,
  BeforeParse,
  BrowserOptions
} from '../Types/types';

import * as Utils from '../utils/utils';

/**
 * Stores jsdom configuration based on user defined BrowserOptions object for future use
 */
export class BrowserConfig {
  readonly runScripts: RunScripts = '';

  readonly strictSSL: Boolean = true;

  readonly unhandledPromptBehaviour: UnhandledPromptBehaviour = 'dismiss';

  readonly resourceLoader: ResourceLoader;

  readonly beforeParse: BeforeParse;

  constructor(options: BrowserOptions) {
    this.resourceLoader = new ResourceLoader({
      strictSSL: this.strictSSL,
    });

    if (!Utils.isBrowserOptions(options))
      throw new Error('Invalid jsdom options');

    Object.keys(options).forEach((option) => {
      this[option] = options[option];
    });

    switch (options.unhandledPromptBehaviour) {
      case 'accept':
        this.beforeParse = BrowserConfig.beforeParseFactory(() => true);
        break;
      case 'dismiss':
        this.beforeParse = BrowserConfig.beforeParseFactory(() => false);
        break;
      case 'dismiss and notify':
        this.beforeParse = BrowserConfig.beforeParseFactory((message) => {
          console.log(message);
          return false;
        });
        break;
      case 'accept and notify':
        this.beforeParse = BrowserConfig.beforeParseFactory((message) => {
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

  static beforeParseFactory(func: BeforeParse) {
    return (window) => {
      ['confirm', 'alert', 'prompt'].forEach((method) => {
        window[method] = func;
      });
    };
  }
}
