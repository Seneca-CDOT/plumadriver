import { toughCookie, JSDOM, ResourceLoader } from 'jsdom';
import { BrowserConfig } from './BrowserConfig';
import { BrowserOptions } from '../Types/types';
import { ELEMENT } from '../constants/constants';
import { WebElement } from '../WebElement/WebElement';

const { Cookie } = toughCookie;

// TODO: include Error classes after migratring to typescript

export class Browser {
  browserConfig: BrowserConfig;
  knownElements: Array<WebElement>;
  dom:JSDOM;
  activeElement:HTMLElement | null;

  constructor(capabilities: object) {
    
    let browserOptions: BrowserOptions = {
      runScripts: '',
      strictSSL: true,
      unhandledPromptBehaviour: 'dismiss',
    };

    Object.keys(browserOptions).forEach((option) => {
      if (capabilities[option]) browserOptions[option] = capabilities[option];
    });

    this.browserConfig = new BrowserConfig(browserOptions);
  }

  async configureBrowser(config:BrowserConfig, url:URL) {
    let dom;

    if (url !== null) {
      dom = await JSDOM.fromURL(url, {
        resources: config.resourceLoader,
        runScripts: config.runScripts,
        beforeParse: config.beforeParse,
      });

      /*  promise resolves after load event has fired. Allows onload events to execute
      before the DOM object can be manipulated  */
      const loadEvent = () => new Promise((resolve) => {
        dom.window.addEventListener('load', () => {
          resolve(dom);
        });
      });

      this.dom = await loadEvent();
    } else {
      this.dom = await new JSDOM(' ', {
        resources: config.resourceLoader,
        runScripts: config.runScripts,
        beforeParse: config.beforeParse,
      });
    }

    // webdriver-active property (W3C)
    this.dom.window.navigator.webdriver = true;
    this.activeElement = this.dom.window.document.activeElement;
  }

  async navigateToURL(url:URL) {
    if (url) {
      await this.configureBrowser(this.browserConfig, url);
    }
    return true;
  }
}
