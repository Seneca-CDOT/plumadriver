process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const driver = require('../pluma-webdriver');

chai.use(chaiHttp);


console.log(process.env.NODE_ENV);

describe('POST /session without anything in the body', () => {
  it('it should return an invalid argument error', (done) => {
    chai.request(driver)
      .post('/session').send({})
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });
});

describe('/POST session with empty capabilities object', () => {
  it('it should throw an invalid argument error', ((done) => {
    const capabilities = {
      capabilities: {},
    };

    chai.request(driver)
      .post('/session')
      .send(capabilities)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  }));
});
