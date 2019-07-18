import * as express from 'express';
import { COMMANDS } from '../constants/constants';
import * as utils from '../utils/utils';

const {sessionEndpointExceptionHandler, defaultSessionEndpointLogic} = utils.endpoint;

const navigate = express.Router();

navigate.post('/', sessionEndpointExceptionHandler(defaultSessionEndpointLogic, COMMANDS.NAVIGATE_TO));
navigate.get('/', sessionEndpointExceptionHandler(defaultSessionEndpointLogic, COMMANDS.GET_CURRENT_URL));

export default navigate;
