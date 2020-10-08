import express from 'express';
import { COMMANDS } from '../constants/constants';
import * as utils from '../utils/utils';

const element = express.Router();

const {
  sessionEndpointExceptionHandler,
  defaultSessionEndpointLogic,
} = utils.endpoint;

element.get(
  '/text',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_ELEMENT_TEXT,
  ),
);
element.post(
  '/element',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.FIND_ELEMENT_FROM_ELEMENT,
  ),
);
element.post(
  '/elements',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.FIND_ELEMENTS_FROM_ELEMENT,
  ),
);
element.get(
  '/name',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_ELEMENT_TAG_NAME,
  ),
);
element.post(
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

element.get('/property/:propertyName', (req, res, next) => {
  if (req.sessionRequest) {
    req.sessionRequest.urlVariables.propertyName = req.params.propertyName;
  }
  return sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_ELEMENT_PROPERTY,
  )(req, res, next);
});

element.post(
  '/click',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.ELEMENT_CLICK,
  ),
);

element.post(
  '/clear',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.ELEMENT_CLEAR,
  ),
);

element.get(
  '/enabled',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.ELEMENT_ENABLED,
  ),
);

element.get(
  '/displayed',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.ELEMENT_IS_DISPLAYED,
  ),
);

element.get(
  '/selected',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.ELEMENT_SELECTED,
  ),
);

export default element;
