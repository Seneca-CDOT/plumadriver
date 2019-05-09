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

    describe('Testing unhandledPromptBehaviour validation', function() {
        
    });
});

