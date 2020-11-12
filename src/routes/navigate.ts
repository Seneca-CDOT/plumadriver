import express from 'express';
import { COMMANDS } from '../constants/constants';
import Pluma from '../Types/types';
import * as utils from '../utils/utils';

const {
  sessionEndpointExceptionHandler,
  defaultSessionEndpointLogic,
} = utils.endpoint;

const navigate = (express.Router() as unknown) as Pluma.CustomRouter;

navigate.post(
  '/',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.NAVIGATE_TO,
  ),
);
navigate.get(
  '/',
  sessionEndpointExceptionHandler(
    defaultSessionEndpointLogic,
    COMMANDS.GET_CURRENT_URL,
  ),
);

export default navigate;
