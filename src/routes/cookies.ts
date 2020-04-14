import express from 'express';
import { COMMANDS } from '../constants/constants';
import * as utils from '../utils/utils';
const {
  defaultSessionEndpointLogic,
  sessionEndpointExceptionHandler,
} = utils.endpoint;

const cookies = express.Router();

cookies.post(
  '/',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.ADD_COOKIE,
  ),
);

cookies.get(
  '/',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_ALL_COOKIES,
  ),
);

cookies.delete(
  '/',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.DELETE_ALL_COOKIES,
  ),
);

cookies.use('/:name', (req, res, next) => {
  req.sessionRequest.urlVariables.cookieName = req.params.name;
  next();
});

cookies.get(
  '/:name',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_NAMED_COOKIE,
  ),
);

cookies.delete(
  '/:name',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.DELETE_COOKIE,
  ),
);

export default cookies;
