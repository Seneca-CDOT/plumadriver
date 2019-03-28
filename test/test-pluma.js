process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const driver = require('../pluma-webdriver');

chai.use(chaiHttp);


console.log(process.env.NODE_ENV);

describe('1: POST /session without anything in the body', () => {
  it('it should return an invalid argument error', (done) => {
    chai.request(driver)
      .post('/session').send({})
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

describe('2: POST /session with empty capabilities object', () => {
  it('it should throw an invalid argument error', ((done) => {
    const capabilities = {
      capabilities: {},
    };

    chai.request(driver)
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
  }));
});

describe('3: POST /session with invalid capabilties', () => {
  it('it should throw an invalid argument error with message specifiying specific invalid capability',
    ((done) => {
      const capabilities = {
        capabilities: {
          alwaysMatch: {
            browserName: false,
          },
        },
      };

      chai.request(driver)
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
    }));
});

describe('4: POST /session with invalid firstMatch capabilities', () => {
  it('it should throw an InvalidArgument error specifying firstMatch capabilities should be an array',
    (done) => {
      const capabilities = {
        capabilities: {
          alwaysMatch: {
            browserName: 'plumadriver',
          },
          firstMatch: {},
        },
      };

      chai.request(driver)
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

// test currently not functional
describe('5: POST /session/:sessionId/url', () => {
  it('it should navigate to the specified website and return null', 
  (done) => {
    let sessionId;
    const capabilities = {
      capabilities: {
        alwaysMatch: {
          browserName: 'plumadriver',
        },
        firstMatch: {},
      },
    };
    chai.request(driver)
      .post('/session')
      .send(capabilities)
      .end((err, res) => {
        sessionId = res.body.value.sessionId;
        console.log(sessionId);
      });
      console.log(sessionId);
    chai.request(driver)  
      .post(`/session/${sessionId}/url`)
      .send({url: "http://example.com"})
      .end((err, res) => {
        console.log(err);
        res.should.have.status(200);
      })
  })
})