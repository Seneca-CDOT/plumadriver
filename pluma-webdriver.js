
const express = require('express');
const args = require('minimist')(process.argv.slice(2)); // for user provided port
const bodyParser = require('body-parser');
const winston = require('winston');
const expressWinston = require('express-winston');

const { SessionsManager } = require('./SessionsManager/SessionsManager');
const { InvalidArgument } = require('./Error/errors.js');
const { router } = require('./routes');


const server = express();
const HTTP_PORT = process.env.PORT || args.port || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

const sessionsManager = new SessionsManager();

server.set('sessionsManager', sessionsManager);

// middleware

server.use(bodyParser.json());

// request logging
if (process.env.NODE_ENV !== 'test') {
  const reqTransports = process.env.NODE_ENV === 'test'
    ? [
      new winston.transports.Console({ level: 'info', timestamp: true }),
      new winston.transports.File({ filename: 'pluma_requests.txt', level: 'info', timestamp: true }),
    ]
    : [new winston.transports.File({ filename: 'pluma_requests.txt', level: 'info', timestamp: true })];


  server.use(expressWinston.logger({
    transports: reqTransports,
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


/*---------------------------------------------------------*/

server.use(router);

if (process.env.NODE_ENV !== 'test') {
  // error logging
  const errTransports = process.env.NODE_ENV === 'test'
    ? [
      new winston.transports.Console({ level: 'error', timestamp: true }),
      new winston.transports.File({ filename: 'pluma_error_log.txt', level: 'error', timestamp: true }),
    ]
    : [new winston.transports.File({ filename: 'pluma_error_log.txt', level: 'error', timestamp: true })];
  server.use(expressWinston.errorLogger({
    transports: errTransports,
    format: winston.format.combine(
      winston.format.json(),
      winston.format.prettyPrint(),
    ),
  }));
}


// error handler
server.use((err, req, res, next) => {
  let error;
  if (err instanceof SyntaxError) error = new InvalidArgument();

  if (error === undefined) res.status(err.code).json(err);
  else res.status(error.code).json(error);
});

server.listen(HTTP_PORT, async () => {
  await onHTTPStart();
});

module.exports = server; // for testing
