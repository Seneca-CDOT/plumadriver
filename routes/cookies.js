
const cookies = require('express').Router();
const { COMMANDS } = require('../commands/commands');

// errors
const {
  NoSuchElement,
} = require('../Error/errors.js');

// add cookie
cookies.post('/', (req, res, next) => {
  const release = req.session.mutex.acquire();
  try {

  } catch (err) {
    next(err);
  } finally {
    release();
  }
});

// get all cookies
cookies.get('/', (req, res, next) => {
  const release = req.session.mutex.acquire();
  try {

  } catch (err) {
    next(err);
  } finally {
    release();
  }
});

// get named cookie
cookies.post('/:name', (req, res, next) => {
  const release = req.session.mutex.acquire();
  try {

  } catch (err) {
    next(err);
  } finally {
    release();
  }
});

// delete cookie
cookies.delete('/:name', (req, res, next) => {
  const release = req.session.mutex.acquire();
  try {

  } catch (err) {
    next(err);
  } finally {
    release();
  }
});

// delete all cookies
cookies.delete('/', (req, res, next) => {
  const release = req.session.mutex.acquire();
  try {

  } catch (err) {
    next(err);
  } finally {
    release();
  }
});

module.exports = cookies;
