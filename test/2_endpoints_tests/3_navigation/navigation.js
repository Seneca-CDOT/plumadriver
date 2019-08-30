
const chai = require('chai');
const chaiHttp = require('chai-http');

const { expect } = chai;
const driver = require('../../../build/index');
chai.use(chaiHttp);

describe('Testing NAVIGATE TO endpoint: POST /session/:sessionId/url', function() {
  let sessionId;
  
  const capabilities = 
    {"capabilities":
      {
        "firstMatch":[
          {
            "browserName":"pluma",
            "plm:plumaOptions":{"runScripts":false},
          }
        ]
      }
    };

  before(function(done){
    chai
      .request(driver)
      .post(`/session`)
      .send(capabilities)
      .end((err, res) => {
        sessionId = res.body.value.sessionId
      });
      done(); 
  }); 

  // test with valid url
  describe('Pass a valid url', function() {
    it('should navigate to the specified website and return an empty body', function (done) {
      chai
        .request(driver)
        .post(`/session/${sessionId}/url`)
        .send({ url: 'http://example.com' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.empty;
        });
        done();
    });
  });

  // test with invalid url
  describe('Pass invalid url', function() {
    it('should do something...', function(done) {
      chai
        .request(driver)
        .post(`/session/${sessionId}/url`)
        .send({url:'I am bob, bob is great..... ahh yes....I am great.'})
        .end((err, res)=> {
          expect(res).to.have.status(400);
          done();
        });
    });

    // TODO: test with invalid url type

    // TODO: test getting the title

    // TODO: test getting the current url

  })
});
