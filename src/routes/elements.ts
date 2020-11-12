import express from 'express';
import { COMMANDS } from '../constants/constants';
import Pluma from '../Types/types';
import * as utils from '../utils/utils';

const element = express.Router();
const elementSession = (element as unknown) as Pluma.CustomRouter;

const {
  sessionEndpointExceptionHandler,
  defaultSessionEndpointLogic,
} = utils.endpoint;

elementSession.get(
  '/text',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_ELEMENT_TEXT,
  ),
);
elementSession.post(
  '/element',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.FIND_ELEMENT_FROM_ELEMENT,
  ),
);
elementSession.post(
  '/elements',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.FIND_ELEMENTS_FROM_ELEMENT,
  ),
);
elementSession.get(
  '/name',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_ELEMENT_TAG_NAME,
  ),
);
elementSession.post(
  '/value',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.ELEMENT_SEND_KEYS,
  ),
);

// get element attribute name
// this endpoint has not been tested as selenium calls execute script instead. Neded to test
element.get('/attribute/:name', (req, _res, _next) => {
  if (req.sessionRequest) {
    req.sessionRequest.urlVariables.attributeName = req.params.name;
  }
  return sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_ELEMENT_ATTRIBUTE,
  );
});

elementSession.get('/css/:propertyName', (req, res, next) => {
  if (req.sessionRequest) {
    req.sessionRequest.urlVariables.propertyName = req.params.propertyName;
  }
  return sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_ELEMENT_CSS_VALUE,
  )(req, res, next);
});

elementSession.get('/property/:propertyName', (req, res, next) => {
  req.sessionRequest.urlVariables.propertyName = req.params.propertyName;
  return sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_ELEMENT_PROPERTY,
  )(req, res, next);
});

elementSession.post(
  '/click',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.ELEMENT_CLICK,
  ),
);

elementSession.post(
  '/clear',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.ELEMENT_CLEAR,
  ),
);

elementSession.get(
  '/enabled',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.ELEMENT_ENABLED,
  ),
);

elementSession.get(
  '/displayed',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.ELEMENT_IS_DISPLAYED,
  ),
);

elementSession.get(
  '/selected',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.ELEMENT_SELECTED,
  ),
);

elementSession.get(
  '/computedlabel',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_COMPUTED_LABEL,
  ),
);

elementSession.get(
  '/computedrole',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_COMPUTED_ROLE,
  ),
);

export default element;
