
const express = require('express');
const args = require('minimist')(process.argv.slice(2)); // for user provided port
const cors = require('cors');
const bodyParser = require('body-parser');
const winston = require('winston');
const expressWinston = require('express-winston');

const { SessionsManager } = require('./SessionsManager/SessionsManager');
const { BadRequest } = require('./Error/errors.js');
const utility = require('./utils/utils');

const server = express();
const HTTP_PORT = process.env.PORT || args['port']; // needs to be changed to accept user provided port with validation and deafult port if none specified.

// middleware
server.use(cors());
server.use(bodyParser.json());
server.use(expressWinston.logger({
  transports: [
    new winston.transports.Console(),
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

// is this needed??
server.use((err, req, res, next) => {
  if (err instanceof SyntaxError) {
    return res.status(400).send(JSON.stringify({
      error: 'The body of your request is not valid json!',
    }));
  }
  console.error(err);
  res.status(500).send();
});

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
server.post('/session', async (req, res) => {
  try {
    // check if request is a JSON object
    if (!await utility.validate.requestBodyType(req, 'application/json')) {
      const error = new BadRequest('invalid argument');
      throw (error);
    }
    const newSession = sessionsManager.createSession(req.body);
    res.json(newSession);
  } catch (error) {
    res.status(error.code).send(error);
    console.log(error); // log to winston to console
  }
});

// delete session
server.delete('/session/:sessionId', (req, res) => {
  try {
    sessionsManager.findSession(req.params.sessionId);
  } catch (error) {
    res.status(error.status).send(error.message); // fix this, error should not be sent but thrown
    // log error to winston not console
  }
  res.send(null);
});

// get title
server.get('/session/:sessionId/title', (req, res) => {
  try {
    const session = sessionsManager.findSession(req.params.sessionId);
    const title = session.browser.getTitle();
    res.send(title);
  } catch (error) {
    console.log(error);
    // TODO: set error status
  }
});

// Navigate to
server.post('/session/:sessionId/:url', async (req, res) => {
  try {
    const session = sessionsManager.findSession(req.params.sessionId);
    await session.browser.navigateToURL(req.params.url);
    res.json(null);
  } catch (error) {
    console.log(error);
    // TODO: set error status
  }
});
/*---------------------------------------------------------*/

server.listen(HTTP_PORT, async () => {
  await onHTTPStart();
});
