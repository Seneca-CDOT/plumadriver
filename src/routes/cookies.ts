
import * as express from 'express';
import { COMMANDS } from '../constants/constants';
import* as utils from '../utils/utils';
const { defaultSessionEndpointLogic, sessionEndpointExceptionHandler } = utils.endpoint;

const cookies = express.Router();

cookies.post('/', sessionEndpointExceptionHandler(defaultSessionEndpointLogic,COMMANDS.ADD_COOKIE));
cookies.get('/', sessionEndpointExceptionHandler(defaultSessionEndpointLogic,COMMANDS.GET_ALL_COOKIES));

// TODO: get named cookie
cookies.post('/:name', sessionEndpointExceptionHandler(defaultSessionEndpointLogic,COMMANDS.GET_NAMED_COOKIE));

// TODO: delete cookie
cookies.delete('/:name', sessionEndpointExceptionHandler(defaultSessionEndpointLogic,COMMANDS.DELETE_COOKIE));

// TODO: delete all cookies
cookies.delete('/', sessionEndpointExceptionHandler(defaultSessionEndpointLogic,COMMANDS.DELETE_ALL_COOKIES));

export default cookies;
