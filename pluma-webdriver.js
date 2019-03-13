
const express = require('express');
const args = require('minimist')(process.argv.slice(2)); // for user provided port
const bodyParser = require('body-parser');
const winston = require('winston');
const expressWinston = require('express-winston');

const { SessionsManager } = require('./SessionsManager/SessionsManager');
const { InvalidArgument } = require('./Error/errors.js');
const utility = require('./utils/utils');

const server = express();
const HTTP_PORT = process.env.PORT || args.port || 3000;

// middleware
server.use(bodyParser.json());

// do not log in testing environment
if (process.env.NODE_ENV !== 'test') {
  // request logging
  server.use(expressWinston.logger({
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'pluma_requests.json', level: 'info' })
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json(),
    ),
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: true,
    colorize: false,
  }));

  // error logging
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
      throw new InvalidArgument('request is not json', 'POST /session');
    }
    const newSession = sessionsManager.createSession(req.body);
    res.json(newSession);
  } catch (error) {
    next(error);
  }
});

// delete session
server.delete('/session/:sessionId', (req, res) => {
  try {
    sessionsManager.findSession(req.params.sessionId);
  } catch (error) {
    res.status(error.status).send(error.message);
    // log error to winston not console
  }
  res.send(null);
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

// Navigate to
server.post('/session/:sessionId/:url', async (req, res, next) => {
  try {
    const session = sessionsManager.findSession(req.params.sessionId);
    await session.browser.navigateToURL(req.params.url);
    res.json(null);
  } catch (error) {
    next(error);
  }
});
/*---------------------------------------------------------*/

// TODO: configure errorlogger to log only useful information
if (process.env.NODE_ENV !== 'test') {
  server.use(expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({}),
      new winston.transports.File({ filename: 'pluma.json', level: 'error' }),
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json(),
    ),
  }));
}


// error handler
server.use((err, req, res, next) => res.status(err.code).json(err));

server.listen(HTTP_PORT, async () => {
  await onHTTPStart();
});

module.exports = server; // for testing
