import { ResourceLoader, BaseOptions, DOMWindow } from 'jsdom';
import { Pluma } from '../Types/types';
import { CookieJar, MemoryCookieStore } from 'tough-cookie';
import { InvalidArgument } from '../Error/errors';

import * as Utils from '../utils/utils';

/**
 * Stores jsdom configuration based on user defined BrowserOptions object for future use
 */
export class BrowserConfig {
  /** defines the context under which scripts can run, if at all */
  runScripts: BaseOptions['runScripts'];

  /** defines whether self-signed or insecure SSL certificates should be trusted */
  strictSSL = true;

  /** defines the type of behavior when a user prompt is encountered see [W3C unhandledPromptBehavior](https://w3c.github.io/webdriver/#dfn-unhandled-prompt-behavior) */
  readonly unhandledPromptBehavior: Pluma.unhandledPromptBehavior = 'dismiss';

  /** the jsdom [resource loader](https://github.com/jsdom/jsdom#loading-subresources)
   * allows a more comprehensive customization of jsdom resource-loading behavior
   */
  readonly resourceLoader: ResourceLoader;

  /** allows modification of the jsdom environment after the Window and Document
   * objects have been created but before any HTML is parsed
   */
  readonly beforeParse!: Pluma.BeforeParse;

  /** a modified tough-cookie cookie jar. Allows '.local' domains to be used for testing purposes
   * by setting the rejectPublicSuffixes option
   */
  readonly jar;

  /** tough-cookie cookieJar option. Prevents public suffixes from being rejected by tough cookie */
  readonly rejectPublicSuffixes!: boolean;

  /**
   * Accepts a [[Pluma.BrowserOptions]] object
   * */
  constructor(options: Pluma.BrowserOptions) {
    if (!Utils.isBrowserOptions(options))
      throw new Error('Invalid jsdom options');

    for (const option in options) {
      if (option === 'strictSSL' && typeof options[option] !== 'boolean')
        throw new InvalidArgument();
      else if (
        option === 'rejectPublicSuffixes' &&
        typeof options[option] !== 'boolean'
      )
        throw new InvalidArgument();
      else if (option === 'runScripts')
        this[option] = options[option] ? 'dangerously' : undefined;
      else if (option === 'strictSSL') this[option] = !options[option];
      else if (option === 'unhandledPromptBehavior')
        this[option] = options[option];
      else if (option === 'rejectPublicSuffixes')
        this[option] = options[option];
    }

    this.resourceLoader = new ResourceLoader({
      strictSSL: this.strictSSL,
    });

    this.jar = new CookieJar(new MemoryCookieStore(), {
      allowSpecialUseDomain: true,
      looseMode: true,
      rejectPublicSuffixes:
        typeof options.rejectPublicSuffixes === 'boolean'
          ? options.rejectPublicSuffixes
          : true,
    });

    switch (options.unhandledPromptBehavior) {
      case 'accept':
        this.beforeParse = this.beforeParseFactory(() => true);
        break;
      case 'dismiss':
        this.beforeParse = this.beforeParseFactory(() => false);
        break;
      case 'dismiss and notify':
        this.beforeParse = this.beforeParseFactory(message => {
          console.log(message);
          return false;
        });
        break;
      case 'accept and notify':
        this.beforeParse = this.beforeParseFactory(message => {
          console.log(message);
          return true;
        });
        break;
      case 'ignore':
        this.beforeParse = window => this.injectAPIs(window);
        break;
      default:
        break;
    }
  }

  /**
   * Accepts a [[Pluma.UserPrompt]] object
   * to define the window.alert, window.prompt and window.confirm methods */
  private beforeParseFactory = (func: Pluma.UserPrompt) => {
    return (window: Pluma.DOMWindow): void => {
      ['confirm', 'alert', 'prompt'].forEach(method => {
        window[method] = func;
      });

      this.injectAPIs(window);
    };
  };

  /**
   * Injects missing APIs into jsdom for better compatibility.
   */
  private injectAPIs(window: Pluma.DOMWindow): void {
    window.HTMLElement.prototype.scrollIntoView = (): void => undefined;
    window.performance.timing = {
      navigationStart: window.performance.timeOrigin,
    };

    window.SVGRectElement = Object.create(window.SVGElement);
    window.SVGRectElement.prototype.getBBox = (): Pluma.SVGRectElement => ({
      x: 1,
      y: 1,
      width: 1,
      height: 1,
    });
  }
}
