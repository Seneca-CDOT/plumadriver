import express from 'express';
import { COMMANDS } from '../constants/constants';
import Pluma from '../Types/types';
import * as utils from '../utils/utils';

const {
  defaultSessionEndpointLogic,
  sessionEndpointExceptionHandler,
} = utils.endpoint;

const cookies = express.Router();
const routerSession = (cookies as unknown) as Pluma.CustomRouter;

routerSession.post(
  '/',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.ADD_COOKIE,
  ),
);
routerSession.get(
  '/',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_ALL_COOKIES,
  ),
);

routerSession.delete(
  '/',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.DELETE_ALL_COOKIES,
  ),
);

cookies.use('/:name', (req, res, next) => {
  if (req.sessionRequest) {
    req.sessionRequest.urlVariables.cookieName = req.params.name;
  }
  next();
});

routerSession.get(
  '/:name',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_NAMED_COOKIE,
  ),
);
routerSession.delete(
  '/:name',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.DELETE_COOKIE,
  ),
);

export default cookies;
