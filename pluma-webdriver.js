
const express = require('express');
const args = require('minimist')(process.argv.slice(2)); // for user provided port
const bodyParser = require('body-parser');
const winston = require('winston');
const expressWinston = require('express-winston');

const { SessionsManager } = require('./SessionsManager/SessionsManager');
const {
  InvalidArgument,
  NoSuchElement,
} = require('./Error/errors.js');
const utility = require('./utils/utils');

const server = express();
const HTTP_PORT = process.env.PORT || args.port || 3000;
process.env.PORT = process.env.PORT || 'dev';

// middleware
server.use(bodyParser.json());

// do not log in testing environment
if (process.env.NODE_ENV !== 'test') {
  // request logging
  server.use(expressWinston.logger({
    transports: [
      new winston.transports.Console({ level: 'info', timestamp: true }),
      new winston.transports.File({ filename: 'pluma-requests.txt', level: 'info', timestamp: true }),
    ],
    format: winston.format.combine(
      winston.format.json(),
      winston.format.prettyPrint(),
    ),
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: true,
    colorize: false,
  }));
}

const sessionsManager = new SessionsManager();

async function onHTTPStart() {
  console.log(`listening on port ${HTTP_PORT}`);
}

/* -------- ENDPOINTS -------------------- */

// code for this endpoint is for testing purposes at the moment
server.get('/', (req, res) => {
  res.send(sessionsManager.sessions);
  // TODO:  some sort of landing page here for plumadriver
});

// Status
server.get('/status', (req, res) => {
  const state = sessionsManager.getReadinessState();
  res.status(200).json(state);
  // this endpoint should be more elaborate relating to readiness state.
});

// New session
server.post('/session', async (req, res, next) => {
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

// set timeouts
server.post('/session/:sessionId/timeouts', async (req, res, next) => {
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
server.delete('/session/:sessionId', (req, res, next) => {
  try {
    sessionsManager.deleteSession(req.params.sessionId);
  } catch (error) {
    next(error);
  }
  res.send(null);
  if (sessionsManager.sessions.length === 0) process.exit(0);
});

// get title
server.get('/session/:sessionId/title', (req, res, next) => {
  try {
    const session = sessionsManager.findSession(req.params.sessionId);
    const title = session.browser.getTitle();
    res.send(title);
  } catch (error) {
    next(error);
  }
});

// find elements
server.post('/session/:sessionId/elements', (req, res, next) => {
  const strategy = req.body.using;
  const selector = req.body.value;
  const response = {
    sessionId: req.params.sessionId,
    status: 0,
  };

  if (!strategy || !selector) throw new InvalidArgument(`POST /session/${req.params.sessionId}/elements`);

  const session = sessionsManager.findSession(req.params.sessionId);
  const startNode = session.browser.dom.window.document;

  if (!startNode) throw new NoSuchElement();

  const result = session.elementRetrieval(startNode, strategy, selector);
  response.value = result;
  res.json(response);
});

// get element text
server.get('/session/:sessionId/element/:elementId/text', (req, res, next) => {
  const session = sessionsManager.findSession(req.params.sessionId);
  const element = session.browser.getKnownElement(req.params.elementId);
  const text = element.getText();
  res.send(text);
});

// Navigate to
server.post('/session/:sessionId/url', async (req, res, next) => {
  try {
    await sessionsManager.navigateSession(req.params.sessionId, req.body.url);
    res.send(null);
  } catch (error) {
    next(error);
  }
});
/*---------------------------------------------------------*/

// TODO: configure errorlogger to log only useful information
if (process.env.NODE_ENV !== 'test') {
  server.use(expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({ timestamp: true }),
      new winston.transports.File({ filename: 'pluma-error.txt', level: 'error' }),
    ],
    format: winston.format.combine(
      winston.format.json(),
      winston.format.prettyPrint(),
    ),
  }));
}


// error handler
server.use((err, req, res, next) => res.status(err.code).json(err));

server.listen(HTTP_PORT, async () => {
  await onHTTPStart();
});


module.exports = server; // for testing
