import {
  ElementBooleanAttributeValues,
  UnhandledPromptBehaviourValues,
  RunScriptsValues
} from '../constants/constants';

import { ResourceLoader } from 'jsdom';

export namespace Pluma {
  type RunScripts = typeof RunScriptsValues.type;
  type UnhandledPromptBehaviour = typeof UnhandledPromptBehaviourValues.type;
  type BeforeParse = (window) => void;
  type UserPrompt = (message? : string) => boolean;
  type ElementBooleanAttribute = typeof ElementBooleanAttributeValues.type;
  
  /**
   * Client defined options for jsdom
   */
  interface BrowserOptions {
    runScripts: RunScripts;
    strictSSL: boolean;
    unhandledPromptBehaviour: UnhandledPromptBehaviour;
    rejectPublicSuffixes: boolean;
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


