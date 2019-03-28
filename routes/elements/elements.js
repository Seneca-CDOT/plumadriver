
const elements = require('express').Router();
const fromElement = require('./fromElement');

// errors
const {
  InvalidArgument,
  NoSuchElement,
} = require('../../Error/errors.js');

// find element(s)
elements.post('/', (req, res, next) => {
  // endpoint currently ignores browsing contexts

  let single = false;

  // conditional checks whether the url is .../elements or /element
  // response differs but process is the same
  // TODO:  THIS NEEDS TO BE A MORE ROBUST CHECK!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  if (req.originalUrl.charAt(req.originalUrl.length - 1) !== 's') {
    single = true;
  }
  const response = {};
  const strategy = req.body.using;
  const selector = req.body.value;
  const startNode = req.session.browser.dom.window.document;
  // TODO: check if element is connected (shadow-root) https://dom.spec.whatwg.org/#connected
  // check W3C endpoint spec for details

  if (!strategy || !selector) throw new InvalidArgument(`POST /session/${req.sessionId}/elements`);

  if (!startNode) throw new NoSuchElement();

  const result = req.session.elementRetrieval(startNode, strategy, selector);
  if (result.length === 0) throw new NoSuchElement();
  response.value = single ? result[0] : result;
  res.json(response);
});

elements.use('/:elementId', (req, res, next) => {
  req.element = req.params.elementId;
  next();
}, fromElement);

module.exports = elements;
