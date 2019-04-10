
// routers
const router = require('express').Router();
const elements = require('./elements/elements');
const timeouts = require('./timeouts');
const navigate = require('./navigate');
const cookies = require('./cookies');

const Request = require('../Request/Request');
const { COMMANDS } = require('../commands/commands');

// errors
const { InvalidArgument } = require('../Error/errors.js');

const utility = require('../utils/utils');

router.use('/session/:sessionId', (req, res, next) => {
  const sessionsManager = req.app.get('sessionsManager');
  req.sessionId = req.params.sessionId;
  req.session = sessionsManager.findSession(req.sessionId);
  req.sessionRequest = new Request(req.params, req.body, null);
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
router.delete('/session/:sessionId', async (req, res, next) => {
  const sessionsManager = req.app.get('sessionsManager');
  const release = req.session.mutex.acquire();
  try {
    req.sessionRequest.command = COMMANDS.DELETE_SESSION;
    await sessionsManager.deleteSession(req.session, req.sessionRequest);
    res.send(null);
    if (sessionsManager.sessions.length === 0) process.exit(0);
  } catch (error) {
    next(error);
  } finally {
    release();
  }
});

// get title
router.get('/session/:sessionId/title', async (req, res, next) => {
  let response = null;
  const release = await req.session.mutex.acquire();
  try {
    req.sessionRequest.command = COMMANDS.GET_TITLE;
    const title = await req.session.process(req.sessionRequest);
    response = { value: title };
    res.send(response);
  } catch (err) {
    next(err);
  } finally {
    release();
  }
});

// element(s) routes
router.use('/session/:sessionId/element', elements);
router.use('/session/:sessionId/elements', elements);

// timeout routes
router.use('/session/:sessionId/timeouts', timeouts);

// navigation routes
router.use('/session/:sessionId/url', navigate);

// cookies routes
router.use('/session/:sessionId/cookie', cookies);

module.exports = { router };
