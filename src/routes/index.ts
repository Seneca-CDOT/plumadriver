// routers
import express, { NextFunction, Response } from 'express';
import element from './elements';
import timeouts from './timeouts';
import navigateSession from './navigate';
import cookies from './cookies';
import Pluma from '../Types/types';
import * as Utils from '../utils/utils';
import { updateTimer } from '../timer';

// pluma commands
import { COMMANDS } from '../constants/constants';

// errors
import { InvalidArgument } from '../Error/errors';

const {
  sessionEndpointExceptionHandler,
  defaultSessionEndpointLogic,
} = Utils.endpoint;
const router = express.Router();
const sessionRouter = (router as unknown) as Pluma.SessionRouter;

sessionRouter.use(
  '/session/:sessionId',
  (req: Pluma.SessionRouteRequest, res: Response, next: NextFunction) => {
    updateTimer();
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
  },
);

// New session
router.post('/session', async (req, res, next) => {
  updateTimer();
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

sessionRouter.delete('/session/:sessionId', async (req, res, next) => {
  updateTimer();
  const sessionManager = req.app.get('sessionManager');
  const release = await req.session.mutex.acquire();
  try {
    req.sessionRequest.command = COMMANDS.DELETE_SESSION;
    await sessionManager.deleteSession(req.session, req.sessionRequest);
    res.send(null);
  } catch (error) {
    next(error);
  } finally {
    release();
  }
});

sessionRouter.get(
  '/session/:sessionId/title',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_TITLE,
  ),
);

sessionRouter.post(
  '/session/:sessionId/execute/sync',
  Utils.handleSeleniumIsDisplayedRequest,
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.EXECUTE_SCRIPT,
  ),
);

sessionRouter.post(
  '/session/:sessionId/element',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.FIND_ELEMENT,
  ),
);

sessionRouter.post(
  '/session/:sessionId/elements',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.FIND_ELEMENTS,
  ),
);

sessionRouter.get(
  '/session/:sessionId/element/active',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_ACTIVE_ELEMENT,
  ),
);

sessionRouter.get(
  '/session/:sessionId/source',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_PAGE_SOURCE,
  ),
);

sessionRouter.post(
  '/session/:sessionId/frame',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.SWITCH_TO_FRAME,
  ),
);

sessionRouter.post(
  '/session/:sessionId/frame/parent',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.SWITCH_TO_PARENT_FRAME,
  ),
);

// timeout routes
sessionRouter.use('/session/:sessionId/timeouts', timeouts);

// navigation routes
sessionRouter.use('/session/:sessionId/url', navigateSession);

// cookies routes
sessionRouter.use('/session/:sessionId/cookie', cookies);

sessionRouter.use(
  '/session/:sessionId/element/:elementId',
  (req: Pluma.SessionRouteRequest, res: Response, next: NextFunction) => {
    updateTimer();
    req.sessionRequest.urlVariables.elementId = req.params.elementId;
    next();
  },
  element,
);
sessionRouter.get('/shutdown', (req, res) => {
  res.json({ value: null });
  process.exit(0);
});

export default router;
