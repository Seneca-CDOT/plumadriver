import express from 'express';
import { InvalidArgument } from '../Error/errors';
import { COMMANDS } from '../constants/constants';

const timeouts = express.Router();

timeouts.get('/', (req, res, next) => {
  const response = { value: req.session.getTimeouts() };
  res.json(response);
});

// set timeouts
timeouts.post('/', (req, res, next) => {
  req.session.setTimeouts(req.body);
  res.send(null);
});

export default timeouts;
