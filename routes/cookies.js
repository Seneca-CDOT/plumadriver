
const cookies = require('express').Router();
const { COMMANDS } = require('../commands/commands');


// add cookie
cookies.post('/', async (req, res, next) => {
  const release = await req.session.mutex.acquire();
  try {
    req.sessionRequest.command = COMMANDS.ADD_COOKIE;
    const response = await req.session.process(req.sessionRequest);
    res.send(response); // returns SUCCESS: null for this endpoint
  } catch (err) {
    next(err);
  } finally {
    release();
  }
});

// get all cookies
cookies.get('/', async (req, res, next) => {
  const release = await req.session.mutex.acquire();
  const response = {};
  try {
    req.sessionRequest.command = COMMANDS.GET_ALL_COOKIES;
    const foundCookies = await req.session.process(req.sessionRequest);
    response.value = foundCookies;
    res.json(response);
  } catch (err) {
    next(err);
  } finally {
    release();
  }
});

// get named cookie
cookies.post('/:name', async (req, res, next) => {
  const release = await req.session.mutex.acquire();
  try {
    // TODO: implement endpoint
  } catch (err) {
    next(err);
  } finally {
    release();
  }
});

// delete cookie
cookies.delete('/:name', async (req, res, next) => {
  const release = await req.session.mutex.acquire();
  try {
    // TODO: implement endpoint
  } catch (err) {
    next(err);
  } finally {
    release();
  }
});

// delete all cookies
cookies.delete('/', async (req, res, next) => {
  const release = await req.session.mutex.acquire();
  try {
    // TODO: implement endpoint
  } catch (err) {
    next(err);
  } finally {
    release();
  }
});

module.exports = cookies;
