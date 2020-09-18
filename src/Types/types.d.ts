import {
  ElementBooleanAttributeValues,
  unhandledPromptBehaviorValues,
  RunScriptsValues,
  PageLoadStrategyValues,
} from '../constants/constants';

/**
 * contains interfaces particular to plumadriver
 */
export namespace Pluma {
  type RunScripts = typeof RunScriptsValues.type;
  type unhandledPromptBehavior = typeof unhandledPromptBehaviorValues.type;
  type BeforeParse = (window) => void;
  type UserPrompt = (message?: string) => boolean;
  type ElementBooleanAttribute = typeof ElementBooleanAttributeValues.type;
  type PageLoadStrategy = typeof PageLoadStrategyValues.type;

  /**
   * Client defined options for jsdom
   */
  interface BrowserOptions {
    runScripts: RunScripts;
    strictSSL: boolean;
    unhandledPromptBehavior: unhandledPromptBehavior;
    rejectPublicSuffixes: boolean;
  }

  /**
   * Expected cookie shape
   */
  interface Cookie {
    name: string;
    value: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    expiry?: number;
    creation?: Date;
    path?: string;
  }

  /**
   * The plumadriver request object structure
   */
  interface Request {
    /** the http url variables */
    urlVariables: {
      elementId?: string;
      attributeName?: string;
      cookieName?: string;
    };
    /** the parameters passed inside the body of the http request */
    parameters: {
      id?: string;
      args?: unknown[];
      script?: string;
      text?: string;
      cookieName?: string;
      value?: string;
      cookie?: Pluma.Cookie;
      using?: string;
      url?: string;
    };
    /** the specific webdriver command to be executed */
    command: string;
  }

  /**
   * The timeouts object which records the timeout duration values used to control the behavior of script evaluation
   * navigation and element retrieval
   */
  interface Timeouts {
    script: number;
    pageLoad: number;
    implicit: number;
  }

  /**
   * defines the shape of the webdriver's readiness state response
   */
  interface ReadinessState {
    status: number;
    value: {
      message: string;
      os: {
        arch: string;
        name: string;
        version: string;
      };
      ready: boolean;
    };
  }

  interface ErrorResponse {
    value: {
      error: string;
      message: string;
      stacktrace: string;
    };
  }

  interface SVGRectElement {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  interface PlumaOptions {
    runScripts: RunScripts;
    unhandledPromptBehavior?: unhandledPromptBehavior;
    rejectPublicSuffixes?: boolean;
    strictSSL?: boolean;
  }

  interface Capabilities {
    pageLoadStrategy?: PageLoadStrategy;
    proxy?: string | Record<string, unknown>;
    timeouts?: Timeouts;
    rejectPublicSuffixes?: boolean;
    unhandledPromptBehavior?: unhandledPromptBehavior;
    acceptInsecureCerts: boolean;
    browserName: string;
    browserVersion: string;
    platformName: NodeJS.Platform;
    setWindowRect: boolean;
    'plm:plumaOptions'?: PlumaOptions;
  }

  interface SerializedWebElement {
    'element-6066-11e4-a52e-4f735466cecf': string;
  }

  interface DOMWindow extends Window {
    eval?: (script: string) => (...args: unknown[]) => unknown;
    NodeList?: [];
    HTMLCollection?: [];
    HTMLElement?: [];
  }

  interface SessionConfig {
    value: {
      sessionId: string;
      capabilities: Capabilities;
    };
  }
}
