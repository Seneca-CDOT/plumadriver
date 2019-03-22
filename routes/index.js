
// routers
const router = require('express').Router();
const element = require('./element');
const timeouts = require('./timeouts');
const navigate = require('./navigate');

// errors
const { InvalidArgument } = require('../Error/errors.js');


const utility = require('../utils/utils');

router.use('/session/:sessionId', (req, res, next) => {
  const sessionsManager = req.app.get('sessionsManager');
  req.sessionId = req.params.sessionId;
  req.session = sessionsManager.findSession(req.params.sessionId);
  next();
});

// New session
router.post('/session', async (req, res, next) => {
  const sessionsManager = req.app.get('sessionsManager');
  try {
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
  const sessionsManager = req.app.get('sessionsManager');
  try {
    sessionsManager.deleteSession(req.params.sessionId);
    res.send(null);
  } catch (error) {
    next(error);
  }
  if (sessionsManager.sessions.length === 0) process.exit(0);
});

// get title
router.get('/session/:sessionId/title', (req, res, next) => {
  const sessionsManager = req.app.get('sessionsManager');
  const session = sessionsManager.findSession(req.params.sessionId);
  const title = session.browser.getTitle();
  res.send(title);
});

// element routes
router.use('/session/:sessionId/element', element);
router.use('/session/:sessionId/elements', element);

// timeout routes
router.use('/session/:sessionId/timeouts', timeouts);

// navigation routes
router.use('/session/:sessionId/url', navigate);

module.exports = router;
