import * as express from 'express';
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
element.get('/attribute/:name', (req, res, next) => {
  req.sessionRequest.urlVariables.attributeName = req.params.name;
  return sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_ELEMENT_ATTRIBUTE,
  );
});

// click element
element.post(
  '/click',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.ELEMENT_CLICK,
  ),
);

// clear element
element.post(
  '/clear',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.ELEMENT_CLEAR,
  ),
);

element.post(
  '/enabled',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.ELEMENT_ENABLED,
  ),
);

export default element;
