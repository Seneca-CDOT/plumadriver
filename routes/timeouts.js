const timeouts = require('express').Router();
const { InvalidArgument } = require('../Error/errors');
const { COMMANDS } = require('../commands/commands');

timeouts.get('/', (req, res, next) => {
  const response = { value: req.session.getTimeouts() };
  res.json(response);
});

// set timeouts
timeouts.post('/', (req, res, next) => {
  req.session.setTimeouts(req.body);
  res.send(null);
});

module.exports = timeouts;
