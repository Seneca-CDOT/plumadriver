
// TODO: create default capabilities object 

class Capabilties {
  constructor(capabilities) {
    this.browserName = capabilities.browserName;
    this.browserVersion = capabilities.browserVersion;
    this.acceptInsecureCerts = capabilities.acceptInsecureCerts;
    this.pageLoadStrategy = capabilities.pageLoadStrategy;
    this.proxy = capabilities.proxy;
    this.setWindowRect = capabilities.setWindowRect;
    this.timeouts = capabilities.timeouts;
    this.unhandledPromptBehaviour = capabilities.unhandledPromptBehaviour;
  }
}

module.exports = Capabilties;
