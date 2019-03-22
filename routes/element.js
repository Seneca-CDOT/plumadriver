
const element = require('express').Router();

// get element text
element.get('/:elementId/text', (req, res, next) => {
  const { session } = req;
  const knownElement = session.browser.getKnownElement(req.params.elementId);
  const text = knownElement.getText();
  res.send(text);
});


module.exports = element;
