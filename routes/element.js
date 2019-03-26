
const element = require('express').Router();

// errors
const {
  InvalidArgument,
  NoSuchElement,
} = require('../Error/errors.js');

// find elements
element.post('/', (req, res, next) => {
  // endpoint currently ignores browsing contexts

  let single = false;

  // conditional checks whether the url is .../elements or /element
  // response differs but process is the same
  if (req.originalUrl.charAt(req.originalUrl.length - 1) !== 's') {
    single = true;
  }
  const response = {};
  const strategy = req.body.using;
  const selector = req.body.value;
  const startNode = req.session.browser.dom.window.document;

  if (!strategy || !selector) throw new InvalidArgument(`POST /session/${req.sessionId}/elements`);

  if (!startNode) throw new NoSuchElement();

  const result = req.session.elementRetrieval(startNode, strategy, selector);
  if (result.length === 0) throw new NoSuchElement();
  console.log(result);
  response.value = single ? result[0] : result;
  console.log(response.value);
  res.json(response);
});

// get element text
element.get('/:elementId/text', (req, res, next) => {
  const { session } = req;
  const knownElement = session.browser.getKnownElement(req.params.elementId);
  const text = knownElement.getText();
  res.send(text);
});


module.exports = element;
