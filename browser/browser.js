
const jsdom = require('jsdom');

const { JSDOM } = jsdom;

class Browser {
  constructor(options) {
    this.dom = new JSDOM();
    this.options = options; // in the future this will be replaced by a default config file
  }

  configureBrowser() {
    // TODO: configure browser based on capabilities
  }

  async navigateToURL(URL) {
    if (URL) {
      try {
        this.dom = await JSDOM.fromURL(URL);
      } catch (err) {
        console.log(err);
      }
    }
  }

  getTitle() {
    return this.dom.window.document.title;
  }
}

module.exports = Browser;
