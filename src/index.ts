import * as express from 'express';
import * as argv from 'minimist'; // for user provided port
import * as bodyParser from 'body-parser';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import { Pluma } from './Types/types';

import { SessionManager } from './SessionManager/SessionManager';
import router from './routes/index';

const args = argv(process.argv.slice(2));
const server = express();
const HTTP_PORT = process.env.PORT || args.port || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

const sessionManager = new SessionManager();

server.set('sessionManager', sessionManager);

// middleware

server.use(bodyParser.json());

// request logging
if (process.env.NODE_ENV !== 'test') {
  const reqTransports =
    process.env.NODE_ENV === 'test'
      ? [
          new winston.transports.Console({ level: 'info' }),
          new winston.transports.File({
            filename: 'pluma_requests.txt',
            level: 'info',
          }),
        ]
      : [
          new winston.transports.File({
            filename: 'pluma_requests.txt',
            level: 'info',
          }),
        ];

  server.use(
    expressWinston.logger({
      transports: reqTransports,
      format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint(),
      ),
      meta: true,
      msg: 'HTTP {{req.method}} {{req.url}}',
      expressFormat: true,
      colorize: false,
    }),
  );
}

router.get('/status', (req, res) => {
  const state = sessionManager.getReadinessState();
  res.status(200).json(state);
});

server.use('/', router);

// error logging
const errTransports =
  process.env.NODE_ENV === 'test'
    ? [
        new winston.transports.Console({ level: 'error' }),
        new winston.transports.File({
          filename: 'pluma_error_log.txt',
          level: 'error',
          handleExceptions: true,
        }),
      ]
    : [
        new winston.transports.File({
          filename: 'pluma_error_log.txt',
          level: 'error',
          handleExceptions: true,
        }),
      ];

server.use(
  expressWinston.errorLogger({
    transports: errTransports,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf((err) => {
        return `[PLUMA ERROR]
        \n${err.meta.date}
        \n${err.meta.stack}        
        \n\treq: ${err.meta.req.method} ${err.meta.req.url}
-------------------------------------------------------------------------------------
        `;
      }),
    ),
  }),
);

// error handler
// eslint-disable-next-line no-unused-vars
server.use((err, req, res, next) => {
  let errorResponse: Pluma.ErrorResponse = {
    value: {
      error: err.JSONCodeError,
      message: err.message,
      stacktrace: err.stack,
    },
  };
  res.status(err.code || err.status || 500).json(errorResponse);
});

server.listen(HTTP_PORT, () => {
  console.log(`plumadriver listening on port ${HTTP_PORT}`);
});

 export {server};
