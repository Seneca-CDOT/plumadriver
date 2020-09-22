import express from 'express';
import { Session } from '../Session/Session';

const timeouts = express.Router();

timeouts.get('/', (req, res) => {
  const response = { value: (req.session as Session).getTimeouts() };
  res.json(response);
});

// set timeouts
timeouts.post('/', (req, res) => {
  (req.session as Session).setTimeouts(req.body);
  res.send({ value: null });
});

export default timeouts;
