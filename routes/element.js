
const element = require('express').Router();

// errors
const {
  InvalidArgument,
  NoSuchElement,
} = require('../Error/errors.js');

// find elements
element.post('/', (req, res, next) => {
  let single = false;
  // conditional checks whether the url is .../elements or /element
  // response differs but process is the same
  if (req.originalUrl.indexOf(req.originalUrl.length - 1) !== 's') {
    single = true;
  }

  const strategy = req.body.using;
  const selector = req.body.value;
  const response = {
    sessionId: req.sessionId,
    status: 0,
  };
  const sessionsManager = req.app.get('sessionsManager');
  const session = sessionsManager.findSession(req.sessionId);
  const startNode = session.browser.dom.window.document;

  if (!strategy || !selector) throw new InvalidArgument(`POST /session/${req.sessionId}/elements`);

  if (!startNode) throw new NoSuchElement();

  const result = session.elementRetrieval(startNode, strategy, selector);
  if (result.length === 0) throw new NoSuchElement();
  response.value = single ? result[0] : result;
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
