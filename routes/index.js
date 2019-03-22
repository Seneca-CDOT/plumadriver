const router = require('express').Router();
const element = require('./element');
const {
  InvalidArgument,
  NoSuchElement,
} = require('../Error/errors.js');
const utility = require('../utils/utils');

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

// navigate
router.post('/session/:sessionId/url', async (req, res, next) => {
  const sessionsManager = req.app.get('sessionsManager');
  try {
    await sessionsManager.navigateSession(req.params.sessionId, req.body.url);
    res.send(null);
  } catch (error) {
    next(error);
  }
});

// get title
router.get('/session/:sessionId/title', (req, res, next) => {
  const sessionsManager = req.app.get('sessionsManager');
  const session = sessionsManager.findSession(req.params.sessionId);
  const title = session.browser.getTitle();
  res.send(title);
});

// find elements
router.post('/session/:sessionId/elements', (req, res, next) => {
  const strategy = req.body.using;
  const selector = req.body.value;
  const response = {
    sessionId: req.params.sessionId,
    status: 0,
  };
  const sessionsManager = req.app.get('sessionsManager');
  const session = sessionsManager.findSession(req.params.sessionId);
  const startNode = session.browser.dom.window.document;

  if (!strategy || !selector) throw new InvalidArgument(`POST /session/${req.params.sessionId}/elements`);


  if (!startNode) throw new NoSuchElement();

  const result = session.elementRetrieval(startNode, strategy, selector);
  response.value = result;
  res.json(response);
});


router.use('/session/:sessionId/element', (req, res, next) => {
  const sessionsManager = req.app.get('sessionsManager');
  req.sessionId = req.params.sessionId;
  req.session = sessionsManager.findSession(req.params.sessionId);
  next();
}, element);

module.exports = router;
