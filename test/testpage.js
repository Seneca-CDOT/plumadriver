const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const url = 'http://localhost:8080';
const { WebElement } = require('../build/WebElement/WebElement');

JSDOM.fromURL(url, {
  runScripts: 'dangerously',
}).then(dom => {
  const {
    window: { document },
  } = dom;
  const button = document.querySelector('#btn-disabled');
  const we = new WebElement(button);
  we.click();
  const log = document.querySelector('#log').textContent;
  console.log(log);
});
