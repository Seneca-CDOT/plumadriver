
const element = require('express').Router();

// errors
const {
  InvalidArgument,
  NoSuchElement,
} = require('../../Error/errors.js');

// get element text
element.get('/text', (req, res, next) => {
  const { session } = req;
  const knownElement = session.browser.getKnownElement(req.params.elementId);
  const text = knownElement.getText();
  res.send(text);
});

// find element(s) from element
element.post(['/element', '/elements'], (req, res, next) => {
  const strategy = req.body.using;
  const selector = req.body.value;
  if (!selector) throw new InvalidArgument();
  // TODO: check if element is connected (shadow-root) https://dom.spec.whatwg.org/#connected
  // check W3C endpoint spec for details
  const startNode = req.session.browser.getKnownElement(req.element);
  const result = req.session.elementRetrieval(startNode, strategy, selector);
  if (result === undefined
    || result === null
    || result.length === 0) throw new NoSuchElement();
    
    res.json()
});

// get element tag name
element.get('/name', (req, res, next) => {

});

// get element attribute name
element.get('/attribute/:name', (req, res, next) => {

});

// send keys to element
element.post('/value', (req, res, next) => {

});

// click element
element.post('/click', (req, res, next) => {

});

// clear element
element.post('/clear', (req, res, next) => {

});


module.exports = element;
