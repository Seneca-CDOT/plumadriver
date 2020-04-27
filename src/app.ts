import express from 'express';
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

router.get('/status', (req, res) => {
  const state = sessionManager.getReadinessState();
  res.status(200).json(state);
});

app.use('/', router);

// error logging
app.use(errorLogger);

// error handler
app.use((err, req, res, _next) => {
  const errorResponse: Pluma.ErrorResponse = {
    value: {
      error: err.JSONCodeError,
      message: err.message,
      stacktrace: err.stack,
    },
  };
  res.status(err.code || err.status || 500).json(errorResponse);
});

export { app };
