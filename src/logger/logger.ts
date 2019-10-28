import * as winston from 'winston';
import * as expressWinston from 'express-winston';

expressWinston.requestWhitelist.push('body');
expressWinston.responseWhitelist.push('body');

export const logger = expressWinston.logger({
  transports: [
    ...(process.env.NODE_ENV === 'test'
      ? [new winston.transports.Console({ level: 'info' })]
      : []),
    new winston.transports.File({
      filename: 'pluma_requests.txt',
      level: 'info',
    }),
  ],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
  ),
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  colorize: false,
});

export const errorLogger = expressWinston.errorLogger({
  transports: [
    ...(process.env.NODE_ENV === 'test'
      ? [new winston.transports.Console({ level: 'error' })]
      : []),
    new winston.transports.File({
      filename: 'pluma_error_log.txt',
      level: 'error',
      handleExceptions: true,
    }),
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(err => {
      return `[PLUMA ERROR]
        \n${err.meta.date}
        \n${err.meta.stack}        
        \n\treq: ${err.meta.req.method} ${err.meta.req.url}
-------------------------------------------------------------------------------------
        `;
    }),
  ),
});
