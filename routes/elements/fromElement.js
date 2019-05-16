
const element = require('express').Router();
const { COMMANDS } = require('../../commands/commands');

// errors
const {
  NoSuchElement,
} = require('../../Error/errors.js');

// get element text
element.get('/text', async (req, res, next) => {
  const release = await req.session.mutex.acquire();
  try {
    req.sessionRequest.command = COMMANDS.GET_ELEMENT_TEXT;
    const text = await req.session.process(req.sessionRequest);
    const response = { value: text };
    res.json(response);
  } catch (err) {
    next(err);
  } finally {
    release();
  }
});

// find element(s) from element
element.post(['/element', '/elements'], async (req, res, next) => {
  let single = false;
  const release = await req.session.mutex.acquire();
  try {
    if (req.originalUrl.slice(req.originalUrl.lastIndexOf('/') + 1) === 'element') {
      single = true;
    }
    req.sessionRequest.command = single
      ? COMMANDS.FIND_ELEMENT_FROM_ELEMENT
      : COMMANDS.FIND_ELEMENTS_FROM_ELEMENT;

    const response = {};
    const result = await req.session.process(req.sessionRequest);
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
element.get('/name', async (req, res, next) => {
  const release = await req.session.mutex.acquire();
  req.sessionRequest.command = COMMANDS.GET_ELEMENT_TAG_NAME;
  try {
    const result = await req.session.process(req.sessionRequest);
    const response = { value: result };
    res.json(response);
  } catch (err) {
    next(err);
  } finally {
    release();
  }
});

// get element attribute name
element.get('/attribute/:name', async (req, res, next) => {
  const release = await req.session.mutex.acquire();
  req.sessionRequest.command = COMMANDS.GET_ELEMENT_ATTRIBUTE;
  req.sessionRequest.urlVariables.attributeName = req.params.name;

  try {
    const result = await req.session.process(req.sessionRequest);
    const response = { value: result };
    console.log(response);
    res.json(response);
  } catch (err) {
    next(err);
  } finally {
    release();
  }
});

// send keys to element
element.post('/value', async (req, res, next) => {
  const release = await req.session.mutex.acquire();
  req.sessionRequest.command = COMMANDS.ELEMENT_SEND_KEYS;
  try {
    await req.session.process(req.sessionRequest);
    res.send(null);
  } catch (err) {
    next(err);
  } finally {
    release();
  }
});

// click element
element.post('/click', (req, res, next) => {

});

// clear element
element.post('/clear', (req, res, next) => {

});


module.exports = element;
