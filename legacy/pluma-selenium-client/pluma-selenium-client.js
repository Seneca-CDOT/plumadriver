/**
 * @fileoverview Defines the {@linkplain Driver WebDriver} client for the JSDOM browser.
 * Every JSDOM session will be created with the default configuration.
 * This ensures that cookies, cache, history, etc are not shared between
 * different instatiations of the JSDOM object
 * 
 * __Customizing JSDOM__
 * The capabilites for any JSDOM object can be customized using the {@linkplain Options} class.
 */

const webdriver = require('selenium-webdriver');
const { Browser, Capabilities } = require('selenium-webdriver/lib/capabilities');

/**
 * Configuration options for the JSDOM driver
 */

const JSDOM_OPTIONS_KEY = 'jsdomOptions';

class Options extends Capabilities {
  /**
   * @param {(Capabilties|Map<string, ?>Object)=} other Another set of
   * capabilties to initialize this instance from.
   */

  constructor(other = undefined) {
    super(other);
    this.setBrowserName(Browser.JSDOM);
  }

  // TODO:  write function to customize JSDOM browser.
  // Needs to be based off jsdom documentation and available configuration
  // would be good to ask client what their specific needs are in order to
  // cater this to them first and add more functionality later on.

  jsdomOptions() {
    const options = this.get(JSDOM_OPTIONS_KEY) ? this.set(JSDOM_OPTIONS_KEY) : {};
    this.options = options;
    return options;
  }
}

exports.Options = Options;
