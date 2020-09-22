// routers
import express from 'express';
import element from './elements';
import timeouts from './timeouts';
import navigate from './navigate';
import cookies from './cookies';
import { Pluma } from '../Types/types';
import { Session } from '../Session/Session';
import * as Utils from '../utils/utils';

const {
  sessionEndpointExceptionHandler,
  defaultSessionEndpointLogic,
} = Utils.endpoint;

// pluma commands
import { COMMANDS } from '../constants/constants';

// errors
import { InvalidArgument } from '../Error/errors';

const router = express.Router();

router.use('/session/:sessionId', (req, res, next) => {
  const sessionsManager = req.app.get('sessionManager');
  const request: Pluma.Request = {
    urlVariables: req.params,
    parameters: req.body,
    command: '',
  };
  req.sessionId = req.params.sessionId;
  req.session = sessionsManager.findSession(req.sessionId);
  req.sessionRequest = request;
  next();
});

// New session
router.post('/session', async (req, res, next) => {
  const sessionManager = req.app.get('sessionManager');
  try {
    // not sure if this conditional is needed here, body-parser checks for this anyway
    if (!(await Utils.validate.requestBodyType(req, 'application/json'))) {
      throw new InvalidArgument();
    }
    const newSession = sessionManager.createSession(req.body);
    res.json(newSession);
  } catch (error) {
    next(error);
  }
});

router.delete('/session/:sessionId', async (req, res, next) => {
  const sessionManager = req.app.get('sessionManager');
  const release = await (req.session as Session).mutex.acquire();
  try {
    (req.sessionRequest as Pluma.Request).command = COMMANDS.DELETE_SESSION;
    await sessionManager.deleteSession(req.session, req.sessionRequest);
    res.send(null);
  } catch (error) {
    next(error);
  } finally {
    release();
  }
});

router.get(
  '/session/:sessionId/title',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_TITLE,
  ),
);

router.post(
  '/session/:sessionId/execute/sync',
  Utils.handleSeleniumIsDisplayedRequest,
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.EXECUTE_SCRIPT,
  ),
);

router.post(
  '/session/:sessionId/element',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.FIND_ELEMENT,
  ),
);

router.post(
  '/session/:sessionId/elements',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.FIND_ELEMENTS,
  ),
);

router.get(
  '/session/:sessionId/element/active',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_ACTIVE_ELEMENT,
  ),
);

router.get(
  '/session/:sessionId/source',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_PAGE_SOURCE,
  ),
);

router.post(
  '/session/:sessionId/frame',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.SWITCH_TO_FRAME,
  ),
);

router.post(
  '/session/:sessionId/frame/parent',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.SWITCH_TO_PARENT_FRAME,
  ),
);

// timeout routes
router.use('/session/:sessionId/timeouts', timeouts);

// navigation routes
router.use('/session/:sessionId/url', navigate);

// cookies routes
router.use('/session/:sessionId/cookie', cookies);

router.use(
  '/session/:sessionId/element/:elementId',
  (req, res, next) => {
    (req.sessionRequest as Pluma.Request).urlVariables.elementId =
      req.params.elementId;
    next();
  },
  element,
);

router.get('/shutdown', (req, res) => {
  res.json({ value: null });
  process.exit(0);
});

export default router;
