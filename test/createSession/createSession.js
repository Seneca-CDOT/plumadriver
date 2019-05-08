
const chai = require('chai');
const chaiHttp = require('chai-http');

const { expect } = chai;
const should = chai.should();
const driver = require('../../pluma-webdriver');

chai.use(chaiHttp);

describe('POST /session without anything in the body', () => {
  it('should return an invalid argument error', function (done) {
    chai
      .request(driver)
      .post('/session')
      .send({})
      .end((err, res) => {
        expect(res, 'response status code should be 400').to.have.status(400);
        expect(res.body, 'response body should be an object').to.be.a('object');
        expect(res.body).to.have.property('value');
        expect(res.body.value).to.have.property('error');
        expect(res.body.value).to.have.property('stacktrace');
        expect(res.body.value).to.have.property('message');
        expect(res.body.value.error).equal('invalid argument');
        done();
      });
  });
});

describe('POST /session with empty capabilities object', () => {
  it('should throw an invalid argument error', function (done) {
    const capabilities = {
      capabilities: {},
    };
    chai
      .request(driver)
      .post('/session')
      .send(capabilities)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.property('value');
        expect(res.body.value).to.have.property('error');
        expect(res.body.value).to.have.property('stacktrace');
        expect(res.body.value).to.have.property('message');
        expect(res.body.value.error).to.equal('invalid argument');
        done();
      });
  });
});

describe('POST /session with invalid capabilties', function () {
  it('should throw an invalid argument error with message specifiying specific invalid capability', (done) => {
    const capabilities = {
      capabilities: {
        alwaysMatch: {
          browserName: false,
        },
      },
    };
    chai
      .request(driver)
      .post('/session')
      .send(capabilities)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('value');
        res.body.value.should.have.property('error');
        res.body.value.should.have.property('stacktrace');
        res.body.value.should.have.property('message');
        res.body.value.error.should.equal('invalid argument');
        done();
      });
  });
});

describe('POST /session with invalid firstMatch capabilities', function () {
  it('should throw an InvalidArgument error specifying firstMatch capabilities should be an array', function (done) {
    const capabilities = {
      capabilities: {
        alwaysMatch: {
          browserName: 'plumadriver',
        },
        firstMatch: {},
      },
    };
    chai
      .request(driver)
      .post('/session')
      .send(capabilities)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('value');
        res.body.value.should.have.property('error');
        res.body.value.should.have.property('stacktrace');
        res.body.value.should.have.property('message');
        res.body.value.error.should.equal('invalid argument');
        done();
      });
  });
});

describe('POST /session with valid capabilties object', function () {
  it('should return the matched capabilties', function (done) {

    done();
  });
});
