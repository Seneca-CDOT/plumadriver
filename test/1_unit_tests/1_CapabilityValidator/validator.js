const CapabilityValidator = require('../../../CapabilityValidator/CapabilityValidator');
const chai = require('chai');
const { expect } = chai;

const testingData = [
    'asdfasdfasd'
    ,true
    ,{}
    ,12345
    ,function(){}
    , false
    ,'none'
    ,'eager'
    ,'normal'
    ,'dismiss'
    ,'accept'
    ,'dismiss and notify'
    ,'accept and notify'
    ,'ignore'
];

const runTestAgainstTestData = (func) => {
    testingData.forEach((data) => {
        func(data);
    });
}

const validator = new CapabilityValidator();


describe('Testing CapabilityValidator class', function () {

    beforeEach(function(){
        validator.valid = true;
    });

    describe('Testing browserName, browserVersion & platformName validation', function() {
        const capabilities = ['browserVersion', 'browserName', 'platformName'];
        let valid;
        
        capabilities.forEach((capability) =>{
            it(`${capability} should only accept string values`,() => {
                runTestAgainstTestData((data)=>{
                    if(data.constructor.name.toLowerCase() === 'string')
                        expect(validator.validate(data, capability)).to.be.true;
                    else
                        expect(validator.validate(data, capability)).to.be.false;
                });
            });
        });   
    });

    describe('Testing acceptInsecureCerts validation', function() {
        it('should only accept boolean values', function(){
            runTestAgainstTestData((data)=>{
                if (data.constructor.name.toLowerCase() === 'boolean')
                    expect(validator.validate(data, 'acceptInsecureCerts')).to.be.true;
                else
                    expect(validator.validate(data, 'acceptInsecureCerts')).to.be.false;
            });
        });
    });

    describe('Testing pageLoadStrategy validation', function(){
        runTestAgainstTestData((data) => {
            if(['normal','eager', 'none'].includes(data)) {
                it(`should accept ${data}`, function() {
                    expect(validator.validate(data, 'pageLoadStrategy')).to.be.true;
                    
                });
                
            } else {
                it(`should reject ${data}`, function() {
                    expect(validator.validate(data, 'pageLoadStrategy')).to.be.false;  
                });
            }
        });
 
    });

    describe('Testing unhandledPromptBehavior validation', function() {
        runTestAgainstTestData((data) => {
            if(
                ['dismiss', 
                'accept',
                'dismiss and notify',
                'accept and notify' ,
                'ignore'].includes(data)
            ) {
                it(`should accept ${data}`, function () {
                    expect(validator.validate(data, 'unhandledPromptBehavior')).to.be.true;
                });
            } else {
                it(`should reject ${data}`, function () {
                    expect (validator.validate(data, 'unhandledPromptBehavior')).to.be.false;
                });
            }
        });
    });

    describe('Testing proxy validation', function () {       

        const proxyTypes = [
            {
                name: 'valid direct proxy',
                expectValid: true,
                value: {
                    proxyType: 'direct'
                }
            },
            {
                name: 'valid pac proxy',
                expectValid: true,
                value:{
                    proxyType: 'pac',
                    proxyAutoConfigUrl: 'http://www.example.com'
                }
            },
            {
                name: 'pac proxy without proxyAutoConfigUrl',
                expectValid: false,
                value: {
                    proxyType: 'pac',
                }
            },
            {
                name: 'pac proxy with invalid proxyAutoConfigUrl',
                expectValid: false,
                value: {
                    proxyType: 'pac',
                    proxyAutoConfigUrl: 'invalid url'
                },
            },
            {
                name: 'manual proxy without ftp, http, ssl, socks or noProxy',
                expectValid: false,
                value: {
                    proxyType: 'manual'
                }
            },
            {
                name: 'manual proxy with ftp, http, ssl and noProxy',
                expectValid: true,
                value: {
                    proxyType: 'manual',
                    ftpProxy: 'http://example.com',
                    httpProxy: 'http://example.com',
                    sslProxy: 'http://example.com',
                    noProxy: ['https://google.com','https://reddit.com']
                }
            },
            {
                name: 'valid socks proxy',
                expectValid: true,
                value: {
                    proxyType: 'manual',
                    socksProxy: 'http://example.com',
                    socksVersion: 254,
                }
            },
            {
                name: 'socks proxy with invalid version',
                expectValid: false,
                value: {
                    proxyType: 'manual',
                    socksProxy: 'http://example.com',
                    socksVersion: 256,
                }
            },
            {
                name: 'socks proxy with invalid host',
                expectValid: false,
                value: {
                    proxyType: 'manual',
                    socksProxy: 'invalid url',
                    socksVersion: 256,
                }
            }
        ];

        runTestAgainstTestData((data) => {
            it(`should reject ${data}`, function(){
                expect(validator.validate(data, 'proxy')).to.be.false;
            });
        });
        
        let acceptReject;
        proxyTypes.forEach((obj) => {
            acceptReject = obj.expectValid ? 'accept' : 'reject';
            it(`should ${acceptReject} ${obj.name}`, function () {
                expect(validator.validate(obj.value, 'proxy')).to.be[obj.expectValid.toString()];
            });
        });
    });

    describe('Testing Timeouts validation', function() {
        const timeoutsTestData = [
            {
                case: 'invalid properties',
                expectValid: false,
                value: {
                    bob: 12345,
                    rob: 67890,
                    dog: 'woof',
                    cat: () => false,
                }
            },
            {
                case: 'invalid types',
                expectValid: false,
                value: {
                    script: 'bob',
                    pageLoad: () => false,
                    implicit: ['bob', 'is', 'bob']
                }
            },
            {
                case: 'valid properties, valid type, invalid value',
                expectValid: false,
                value: {
                    script: -1,
                    pageLoad: -1,
                    implicit: -1
                }
            },
            {
                case: 'valid properties, type and value',
                expectValid: true,
                value: {
                    script: 1000,
                    pageLoad: 1000,
                    implicit: 1000
                }
            }
        ];
        
        timeoutsTestData.forEach((test) => {
            const acceptReject = test.expectValid 
                ? 'accept'
                : 'reject';
            Object.keys(test.value).forEach((property) => {
                it(`should ${acceptReject} ${test.case}.
                    \ Property: ${property},
                    \ value: ${test.value[property].toString()},
                    \ type: ${test.value[property].constructor.name}`,
                 function(){
                    const pass = validator.validateTimeouts(property, test.value[property]);
                    expect (pass).to.be[test.expectValid.toString()];
                });
            });
        });
    });

    describe('Testing PlumaOptions validation', function(){
        const plumaOptionsTestData = {

        }
    });
});

