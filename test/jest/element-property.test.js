const nock = require('nock');
const request = require('supertest');
const app  = require('../../src/app');

const { Session } = require('../../build/Session/Session');
const { COMMANDS, ELEMENT } = require('../../build/constants/constants');







  const setScopeAndNavigate = async pageSource => {
    nock(/plumadriver\.com/)
      .get('/')
      .reply(200, pageSource);

    await session.process({
      command: COMMANDS.NAVIGATE_TO,
      parameters: { url: 'http://plumadriver.com' },
    });
  }

  const findElement = async selector => {
    const { [ELEMENT]: elementId } = await session.process({
      command: COMMANDS.FIND_ELEMENT,
      parameters: {
        using: 'css selector',
        value: selector,
      },
    });

    return elementId;
  };

  const elementProperty = async (selector,property,expectation) => {
    const elementId = await findElement(selector);
    const propertyName = property;
    const  value  = await session.process({
      command: COMMANDS.GET_ELEMENT_PROPERTY,
      urlVariables: { elementId,propertyName},
    });
    expect(value).toStrictEqual(expectation);
  };

  beforeAll(async () => {
    const requestBody = {
      desiredCapabilities: {
        browserName: 'pluma',
        unhandledPromptBehavior: 'ignore',
        
        'plm:plumaOptions': { runScripts: true },
      },
      capabilities: {
        firstMatch: [
          {
            browserName: 'pluma',
            'plm:plumaOptions': { runScripts: true },
            unhandledPromptBehavior: 'ignore',
          },
        ],
      },
    };

    session = new Session(requestBody);
  });


  it('returns tagName property from option element ', async () => {
    const pageSource = `<!DOCTYPE html>
    <html>
    <head>
      <title>Test Page</title>
    </head>
    <body>
      <select>
        <option value='foo' selected id="baz">foo<option>
        <option value='bar'>bar<option>
      </select>
    </body>
    </html>`;

    await setScopeAndNavigate(pageSource);
    await elementProperty('#baz',"tagName" ,'OPTION');
  });

  it('returns href property from the a element', async () => {
    const pageSource = `<!DOCTYPE html>
    <html>
    <head>
      <title>Test Page</title>
    </head>
    <body>
    <a href= 'https://www.google.com/' id="link"> </a>
    </body>
    </html>`;

    await setScopeAndNavigate(pageSource);
    await elementProperty('#link',"href" ,'https://www.google.com/');
  });

  it('returns null when property not found ', async () => {
    const pageSource = `<!DOCTYPE html>
    <html>
    <head>
      <title>Test Page</title>
    </head>
    <body>
      <select>
        <option value='foo' selected id="bar">foo<option>
        <option value='bar'>bar<option>
      </select>
    </body>
    </html>`;

    await setScopeAndNavigate(pageSource);
    await elementProperty('#bar',"asdad" ,{"value": null});
  });
  it('test if supertest can find the routes successfully',function(done){
    request(app)
    .get("/")
        .then(response => {
          expect(response.status).toBe(0);
          done();
  })
})
