import express from 'express';
import Pluma from '../Types/types';

const timeouts = (express.Router() as unknown) as Pluma.SessionRouter;

timeouts.get('/', (req, res) => {
  const response = { value: req.session.getTimeouts() };
  res.json(response);
});

// set timeouts
timeouts.post('/', (req, res) => {
  req.session.setTimeouts(req.body);
  res.send({ value: null });
});

export default timeouts;
