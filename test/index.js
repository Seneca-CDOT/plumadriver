process.env.NODE_ENV = 'test';

const { importTest, getTests } = require('./test_utils');

const unitTests = getTests('test/1_unit_tests', 'index.js', 'test_utils.js');
const endpointTests = getTests('test/2_endpoints_tests', 'index.js', 'test_utils.js');

describe("Testing Plumadriver... \n", function() {
        
    this.timeout(10000);
    
    describe('Unit Tests:\n', function () {
        unitTests.forEach((test) => {
            importTest(test);
        });
    });
    
    describe('Endpoint Tests:\n', function() {
        endpointTests.forEach((test) => {
            importTest(test);
        });
    });
});