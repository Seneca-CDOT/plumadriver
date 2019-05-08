
const chai = require('chai');
const chaiHttp = require('chai-http');

const { expect } = chai;
const should = chai.should();
const driver = require('../../pluma-webdriver');

chai.use(chaiHttp);

// test currently not functional
describe('POST /session/:sessionId/url', function() {
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

    it('it should navigate to the specified website and return null', (done) => {
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