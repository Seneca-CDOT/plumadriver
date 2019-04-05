
const element = require('express').Router();
const { COMMANDS } = require('../../commands/commands');

// errors
const {
  NoSuchElement,
} = require('../../Error/errors.js');

// get element text
element.get('/text', (req, res, next) => {
  const release = req.session.mutex.acquire();
  try {
    req.sessionRequest.command = COMMANDS.GET_ELEMENT_TEXT;
    const text = req.session.process(req.sessionRequest);
    const response = { value: text };
    res.json(response);
  } catch (err) {
    next(err);
  } finally {
    release();
  }
});

// find element(s) from element
element.post(['/element', '/elements'], (req, res, next) => {
  let single = false;
  const release = req.session.mutex.acquire();
  try {
    if (req.originalUrl.slice(req.originalUrl.lastIndexOf('/') + 1) === 'element') {
      single = true;
    }
    req.sessionRequest.command = single
      ? COMMANDS.FIND_ELEMENT_FROM_ELEMENT
      : COMMANDS.FIND_ELEMENTS_FROM_ELEMENT;

    const response = {};
    const result = req.session.process(req.sessionRequest);
    if (result === undefined
      || result === null
      || result.length === 0) throw new NoSuchElement();

    response.value = single ? result[0] : result;
    res.json(response);
  } catch (err) {
    next(err);
  } finally {
    release();
  }
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
