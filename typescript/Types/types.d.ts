import {
  ElementBooleanAttributeValues,
  UnhandledPromptBehaviourValues,
  RunScriptsValues
} from '../constants/constants';

import { ResourceLoader } from 'jsdom';

export namespace Pluma {
  type RunScripts = typeof RunScriptsValues.type;
  type UnhandledPromptBehaviour = typeof UnhandledPromptBehaviourValues.type;
  type BeforeParse = (message?: string) => void;
  type ElementBooleanAttribute = typeof ElementBooleanAttributeValues.type;
  
  /**
   * Client defined options for jsdom
   */
  interface BrowserOptions {
    runScripts: RunScripts;
    strictSSL: boolean;
    unhandledPromptBehaviour: UnhandledPromptBehaviour;
  }
  
  /**
   * Expected cookie shape
   */
  interface Cookie {
    name: string;
    value: string | boolean;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    expiry?: number;
  }
  
  interface PlumaRequest {
    urlVariables:any;
    parameters:any;
    command: string;
  }
}


