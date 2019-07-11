
const chai = require('chai');
const chaiHttp = require('chai-http');

const { expect } = chai;
const should = chai.should();
const driver = require('../../../build/index');

chai.use(chaiHttp);

describe('Testing Cookies related enpoints\
    \n\t- Get all cookies GET /session/:sessionId/cookies\
    \n\t- Add Cookie POST /session/:sessionId/cookie', function () {

    describe('Test', function() {
        it('should do something here...');
    });

});