import { ResourceLoader } from 'jsdom';
import { Pluma } from '../Types/types';
import { CookieJar, MemoryCookieStore } from '../jsdom_extensions/tough-cookie/lib/cookie';
import { InvalidArgument } from '../Error/errors';

import * as Utils from '../utils/utils';

/**
 * Stores jsdom configuration based on user defined BrowserOptions object for future use
 */
export class BrowserConfig {
  /** defines the context under which scripts can run, if at all */
  runScripts: Pluma.RunScripts | null;
  /** defines whether self-signed or insecure SSL certificates should be trusted */
  strictSSL: boolean = true;
  /** defines the type of behaviour when a user prompt is encountered see [W3C unhandledPromptBehaviour](https://w3c.github.io/webdriver/#dfn-unhandled-prompt-behavior) */
  readonly unhandledPromptBehaviour: Pluma.UnhandledPromptBehaviour = 'dismiss';
  /** the jsdom [resource loader](https://github.com/jsdom/jsdom#loading-subresources)
   * allows a more comprehensive customization of jsdom resource-loading behaviour
   */
  readonly resourceLoader: ResourceLoader;
  /** allows modification of the jsdom environment after the Window and Document
   * objects have been created but before any HTML is parsed
    */
  readonly beforeParse: Pluma.BeforeParse;
  /** a modified tough-cookie cookie jar. Allows '.local' domains to be used for testing purposes
   * by setting the rejectPublicSuffixes option
   */
  readonly jar;
  /** tough-cookie cookieJar option. Prevents public suffixes from being rejected by tough cookie */
  readonly rejectPublicSuffixes: boolean;

  /**
   * Accepts a [[Pluma.BrowserOptions]] object
   * */
  constructor(options: Pluma.BrowserOptions) {
    if (!Utils.isBrowserOptions(options))
      throw new Error('Invalid jsdom options');

    Object.keys(options).forEach((option) => {
      if (option === 'strictSSL' && typeof options[option] !== 'boolean')
        throw new InvalidArgument();
      else if (
        option === 'rejectPublicSuffixes' &&
        typeof options[option] !== 'boolean'
      )
        throw new InvalidArgument();
      else if (option === 'runScripts')
        this[option] = options[option] ? 'dangerously' : undefined;
      else if (option === 'strictSSL') this[option] = !options[option]
      else this[option] = options[option];
    });

    this.resourceLoader = new ResourceLoader({
      strictSSL: this.strictSSL,
    });

    this.jar = new CookieJar(new MemoryCookieStore(), {
      looseMode: true,
      rejectPublicSuffixes:
        typeof options.rejectPublicSuffixes === 'boolean'
          ? options.rejectPublicSuffixes
          : true,
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

  /**
   * Accepts a [[Pluma.UserPrompt]] object
   * to define the window.alert, window.prompt and window.confirm methods */
  static beforeParseFactory(func: Pluma.UserPrompt) {
    return (window) => {
      ['confirm', 'alert', 'prompt'].forEach((method) => {
        window[method] = func;
      });
    };
  }
}
