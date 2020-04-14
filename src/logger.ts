import winston from 'winston';
import expressWinston from 'express-winston';

const LOG_FOLDER_NAME = 'pluma-logs';
const FILENAMES = {
  REQUESTS: 'pluma-requests.txt',
  ERRORS: 'pluma-errors.txt',
};

expressWinston.requestWhitelist.push('body');
expressWinston.responseWhitelist.push('body');

export const logger = expressWinston.logger({
  transports: [
    new winston.transports.File({
      filename: `${LOG_FOLDER_NAME}/${FILENAMES.REQUESTS}`,
      level: 'info',
    }),
  ],
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
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
    new winston.transports.File({
      filename: `${LOG_FOLDER_NAME}/${FILENAMES.ERRORS}`,
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
