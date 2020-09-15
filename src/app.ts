import express from 'express';
import { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { logger, errorLogger } from './logger';
import { Pluma } from './Types/types';

import { SessionManager } from './SessionManager/SessionManager';
import router from './routes/index';

const app = express();
const sessionManager = new SessionManager();

app.set('sessionManager', sessionManager);

// middleware
app.use(bodyParser.json());

// request logging
app.use(logger);

router.get('/status', (req: Request, res: Response) => {
  const state = sessionManager.getReadinessState();
  res.status(200).json(state);
});

app.use('/', router);

// error logging
app.use(errorLogger);

// error handler
app.use(
  (
    err: Record<string, unknown>,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const errorResponse: Pluma.ErrorResponse = {
      value: {
        error: err.JSONCodeError as string,
        message: err.message as string,
        stacktrace: err.stack as string,
      },
    };
    res
      .status((err.code as number) || (err.status as number) || 500)
      .json(errorResponse);
  },
);

export { app };
