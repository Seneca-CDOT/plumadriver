
const defaultRequiredCapabilities = {
  acceptInsecureCerts: 'boolean',
  browserName: 'string',
  browserVersion: 'string',
  platformName: 'string',
  pageLoadStrategy: {
    type: 'string',
    values: [
      'none',
      'eager',
      'normal',
    ],
  },
};

module.exports = defaultRequiredCapabilities;
