
const uuidv1 = require('uuid/v1');

// routers
const router = require('express').Router();
const elements = require('./elements/elements');
const timeouts = require('./timeouts');
const navigate = require('./navigate');
const Request = require('../Request/Request');
const { COMMANDS } = require('../commands/commands');

// errors
const { InvalidArgument } = require('../Error/errors.js');

const utility = require('../utils/utils');

router.use('/session/:sessionId', (req, res, next) => {
  const sessionsManager = req.app.get('sessionsManager');
  req.sessionId = req.params.sessionId;
  req.session = sessionsManager.findSession(req.sessionId);
  req.sessionRequest = new Request(req.params, req.body, null, uuidv1());
  next();
});

// New session
router.post('/session', async (req, res, next) => {
  const sessionsManager = req.app.get('sessionsManager');
  try {
    // not sure if this conditional is needed here, body-parser checks for this anyway
    if (!await utility.validate.requestBodyType(req, 'application/json')) {
      throw new InvalidArgument('POST /session');
    }
    const newSession = sessionsManager.createSession(req.body);
    res.json(newSession);
  } catch (error) {
    next(error);
  }
});

// delete session
router.delete('/session/:sessionId', (req, res, next) => {
  // is try catch needed here???
  const sessionsManager = req.app.get('sessionsManager');
  try {
    req.sessionRequest.command = COMMANDS.DELETE_SESSION;
    req.session.requestQueue.push(req.sessionRequest);
    sessionsManager.deleteSession(req.session, req.sessionRequest);
    res.send(null);
  } catch (error) {
    next(error);
  }
  if (sessionsManager.sessions.length === 0) process.exit(0);
});

// get title
router.get('/session/:sessionId/title', async (req, res, next) => {
  req.sessionRequest.command = COMMANDS.GET_TITLE;
  req.session.requestQueue.push(req.sessionRequest);
  const title = await req.session.process(req.sessionRequest);
  const response = { value: title };
  res.send(response);
});

// element(s) routes
router.use('/session/:sessionId/element', elements);
router.use('/session/:sessionId/elements', elements);

// timeout routes
router.use('/session/:sessionId/timeouts', timeouts);

// navigation routes
router.use('/session/:sessionId/url', navigate);

module.exports = { router };
