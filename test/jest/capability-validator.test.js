const validator = require('validator');

const {
  default: CapabilityValidator,
} = require('../../build/CapabilityValidator/CapabilityValidator');

const testingData = [
  'asdfasdfasd',
  true,
  {},
  12345,
  function() {},
  false,
  'none',
  'eager',
  'normal',
  'dismiss',
  'accept',
  'dismiss and notify',
  'accept and notify',
  'ignore',
  'http://example.com',
  'text/html',
  'application/xml',
  'useable',
];

const runTestAgainstTestData = func => {
  testingData.forEach(data => {
    func(data);
  });
};

const capabilityValidator = new CapabilityValidator();
describe('Testing CapabilityValidator class', () => {
  beforeEach(() => {
    capabilityValidator.valid = true;
  });

  describe('Testing browserName, browserVersion & platformName validation', () => {
    const capabilities = ['browserVersion', 'browserName', 'platformName'];
    let valid;

    capabilities.forEach(capability => {
      it(`${capability} should only accept string values`, () => {
        runTestAgainstTestData(data => {
          if (typeof data === 'string')
            expect(capabilityValidator.validate(data, capability)).toBe(true);
          else
            expect(capabilityValidator.validate(data, capability)).toBe(false);
        });
      });
    });
  });

  describe('Testing acceptInsecureCerts validation', () => {
    it('should only accept boolean values', () => {
      runTestAgainstTestData(data => {
        if (typeof data === 'boolean')
          expect(
            capabilityValidator.validate(data, 'acceptInsecureCerts'),
          ).toBe(true);
        else
          expect(
            capabilityValidator.validate(data, 'acceptInsecureCerts'),
          ).toBe(false);
      });
    });
  });

  describe('Testing pageLoadStrategy validation', () => {
    runTestAgainstTestData(data => {
      if (['normal', 'eager', 'none'].includes(data)) {
        it(`should accept ${data}`, () => {
          expect(capabilityValidator.validate(data, 'pageLoadStrategy')).toBe(
            true,
          );
        });
      } else {
        it(`should reject ${data}`, () => {
          expect(capabilityValidator.validate(data, 'pageLoadStrategy')).toBe(
            false,
          );
        });
      }
    });
  });

  describe('Testing unhandledPromptBehavior validation', () => {
    runTestAgainstTestData(data => {
      if (
        [
          'dismiss',
          'accept',
          'dismiss and notify',
          'accept and notify',
          'ignore',
        ].includes(data)
      ) {
        it(`should accept ${data}`, () => {
          expect(
            capabilityValidator.validate(data, 'unhandledPromptBehavior'),
          ).toBe(true);
        });
      } else {
        it(`should reject ${data}`, () => {
          expect(
            capabilityValidator.validate(data, 'unhandledPromptBehavior'),
          ).toBe(false);
        });
      }
    });
  });

  describe('Testing proxy validation', () => {
    const proxyTypes = [
      {
        name: 'valid direct proxy',
        expectValid: true,
        value: {
          proxyType: 'direct',
        },
      },
      {
        name: 'valid pac proxy',
        expectValid: true,
        value: {
          proxyType: 'pac',
          proxyAutoConfigUrl: 'http://www.example.com',
        },
      },
      {
        name: 'pac proxy without proxyAutoConfigUrl',
        expectValid: false,
        value: {
          proxyType: 'pac',
        },
      },
      {
        name: 'pac proxy with invalid proxyAutoConfigUrl',
        expectValid: false,
        value: {
          proxyType: 'pac',
          proxyAutoConfigUrl: 'invalid url',
        },
      },
      {
        name: 'manual proxy without ftp, http, ssl, socks or noProxy',
        expectValid: false,
        value: {
          proxyType: 'manual',
        },
      },
      {
        name: 'manual proxy with ftp, http, ssl and noProxy',
        expectValid: true,
        value: {
          proxyType: 'manual',
          ftpProxy: 'http://example.com',
          httpProxy: 'http://example.com',
          sslProxy: 'http://example.com',
          noProxy: ['https://google.com', 'https://reddit.com'],
        },
      },
      {
        name: 'valid socks proxy',
        expectValid: true,
        value: {
          proxyType: 'manual',
          socksProxy: 'http://example.com',
          socksVersion: 254,
        },
      },
      {
        name: 'socks proxy with invalid version',
        expectValid: false,
        value: {
          proxyType: 'manual',
          socksProxy: 'http://example.com',
          socksVersion: 256,
        },
      },
      {
        name: 'socks proxy with invalid host',
        expectValid: false,
        value: {
          proxyType: 'manual',
          socksProxy: 'invalid url',
          socksVersion: 256,
        },
      },
    ];

    runTestAgainstTestData(data => {
      it(`should reject ${data}`, () => {
        expect(capabilityValidator.validate(data, 'proxy')).toBe(false);
      });
    });

    let acceptReject;
    proxyTypes.forEach(obj => {
      acceptReject = obj.expectValid ? 'accept' : 'reject';
      it(`should ${acceptReject} ${obj.name}`, () => {
        expect(capabilityValidator.validate(obj.value, 'proxy')).toBe[
          obj.expectValid.toString()
        ];
      });
    });
  });

  describe('Testing Timeouts validation', () => {
    const timeoutsTestData = [
      {
        case: 'invalid properties',
        expectValid: false,
        value: {
          bob: 12345,
          rob: 67890,
          dog: 'woof',
          cat: () => false,
        },
      },
      {
        case: 'invalid types',
        expectValid: false,
        value: {
          script: 'bob',
          pageLoad: () => false,
          implicit: ['bob', 'is', 'bob'],
        },
      },
      {
        case: 'valid properties, valid type, invalid value',
        expectValid: false,
        value: {
          script: -1,
          pageLoad: -1,
          implicit: -1,
        },
      },
      {
        case: 'valid properties, type and value',
        expectValid: true,
        value: {
          script: 1000,
          pageLoad: 1000,
          implicit: 1000,
        },
      },
    ];

    timeoutsTestData.forEach(test => {
      const acceptReject = test.expectValid ? 'accept' : 'reject';
      Object.keys(test.value).forEach(property => {
        it(`should ${acceptReject} ${test.case}.
                    \ Property: ${property},
                    \ value: ${test.value[property].toString()},
                    \ type: ${test.value[property].constructor.name}`, () => {
          const pass = capabilityValidator.validateTimeouts(
            property,
            test.value[property],
          );
          expect(pass).toBe[test.expectValid.toString()];
        });
      });
    });
  });

  describe('Testing PlumaOptions validation', () => {
    const testData = [
      'http://example.com',
      true,
      123456,
      () => {},
      'text/html',
      'useable',
      'application/xml',
    ];

    const options = [
      'url',
      'referrer',
      'contentType',
      'includeNodeLocations',
      'storageQuota',
      'runScripts',
      'resources',
    ];

    options.forEach(option => {
      testData.forEach(data => {
        const valid = capabilityValidator.validate(
          { [option]: data },
          'plm:plumaOptions',
        );
        let expectValid = false;
        switch (option) {
          case 'url':
          case 'referrer':
            try {
              expectValid = validator.isURL(data);
            } catch (err) {
              expectValid = false;
            }
            break;
          case 'contentType':
            expectValid = data === 'text/html' || data === 'application/xml';
            break;
          case 'includeNodeLocations':
          case 'runScripts':
            expectValid = data.constructor === Boolean;
            break;
          case 'storageQuota':
            expectValid = Number.isInteger(data);
            break;
          case 'resources':
            expectValid = data === 'useable';
            break;
          default:
            break;
        }
        const acceptReject = expectValid ? 'accept' : 'reject';

        it(`should ${acceptReject} ${option} with value ${data}`, () => {
          expect(valid).toBe[expectValid.toString()];
        });
      });
    });
  });
});
