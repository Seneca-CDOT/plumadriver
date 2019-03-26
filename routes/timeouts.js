const timeouts = require('express').Router();
const { InvalidArgument } = require('../Error/errors');

timeouts.get('/', (req, res, next) => {

});

// set timeouts
timeouts.post('/', async (req, res, next) => {
  req.session.setTimeouts(req.body);
  res.send(null);
});

module.exports = timeouts;
