const navigate = require('express').Router();

// navigate
navigate.post('/', async (req, res, next) => {
  const sessionsManager = req.app.get('sessionsManager');
  try {
    await sessionsManager.navigateSession(req.sessionId, req.body.url);
    res.send(null);
  } catch (error) {
    next(error);
  }
});

module.exports = navigate;
