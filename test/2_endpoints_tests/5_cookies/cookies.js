
const chai = require('chai');
const chaiHttp = require('chai-http');

const { expect } = chai;
const should = chai.should();
const driver = require('../../../pluma-webdriver');

chai.use(chaiHttp);

describe('Testing Cookies related enpoints\
    \n\t- Get all cookies GET /session/:sessionId/cookies\
    \n\t- Add Cookie POST /session/:sessionId/cookie', function () {

    // TODO: test getting all cookies
    describe('Get all cookies', function() {
        it('should do something here...');
    });

    // TODO: test adding a valid cookie

    // TODO: test adding invalid cookie

});