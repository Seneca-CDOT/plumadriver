import { ElementBooleanAttribute } from "../constants/constants";
import { ResourceLoader } from "jsdom";
import {
  StringUnion,
  UnhandledPromptBehaviourValues,
  RunScriptsValues
} from "../utils/utils";

export type RunScripts = typeof RunScriptsValues.type;

export type UnhandledPromptBehaviour = typeof UnhandledPromptBehaviourValues.type;
export type BeforeParse = (message?: string) => void;

export type ElementBooleanAttribute = typeof ElementBooleanAttribute.type;

/**
 * Client defined options for jsdom
 */
export interface BrowserOptions {
  runScripts: RunScripts;
  strictSSL: boolean;
  unhandledPromptBehaviour: UnhandledPromptBehaviour;
}

/**
 * Expected cookie shape
 */
export interface Cookie {
  name: string;
  value: string | boolean;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  expiry?: number;
}
