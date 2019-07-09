import * as express from 'express';
import { COMMANDS } from '../constants/constants';

const navigate = express.Router();
// navigate to
navigate.post('/', async (req, res, next) => {
  const release = await req.session.mutex.acquire();
  try {
    req.sessionRequest.command = COMMANDS.NAVIGATE_TO;
    const response = await req.session.process(req.sessionRequest);
    res.send(response);
  } catch (error) {
    next(error);
  } finally {
    release();
  }
});

// get current url
navigate.get('/', async (req, res, next) => {
  const release = await req.session.mutex.acquire();
  try {
    req.sessionRequest.command = COMMANDS.GET_CURRENT_URL;
    const response = await req.session.process(req.sessionRequest);
    res.send(response);
  } catch (error) {
    next(error);
  } finally {
    release();
  }
});
export default navigate;
