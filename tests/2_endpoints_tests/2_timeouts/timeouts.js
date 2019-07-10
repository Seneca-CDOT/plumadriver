
const chai = require('chai');
const chaiHttp = require('chai-http');

const { expect } = chai;
const should = chai.should();
const driver = require('../../../pluma-webdriver');


chai.use(chaiHttp);