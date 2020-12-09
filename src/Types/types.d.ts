import { BaseOptions, DOMWindow as JSDOMDOMWindow } from 'jsdom';
import { Store } from 'tough-cookie';
import {
  NextFunction,
  Router,
  Request as ExpressRequest,
  Response as ExpressResponse,
  Application,
} from 'express';
import {
  ElementBooleanAttributeValues,
  unhandledPromptBehaviorValues,
  PageLoadStrategyValues,
} from '../constants/constants';

import Session from '../Session/Session';

/**
 * contains interfaces particular to plumadriver
 */
declare namespace Pluma {
  type unhandledPromptBehavior = typeof unhandledPromptBehaviorValues.type;
  type BeforeParse = (window: DOMWindow) => void;
  type UserPrompt = (message?: string) => boolean;
  type ElementBooleanAttribute = typeof ElementBooleanAttributeValues.type;
  type PageLoadStrategy = typeof PageLoadStrategyValues.type;

  /**
   * Client defined options for jsdom
   */
  interface BrowserOptions {
    runScripts: BaseOptions['runScripts'];
    strictSSL: boolean;
    unhandledPromptBehavior: unhandledPromptBehavior;
    rejectPublicSuffixes: boolean;
    idleTimer: boolean;
    maxIdleTime: number;
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

  interface CustomRequestCallback {
    (
      req: Pluma.SessionRouteRequest,
      res: ExpressResponse,
      next: NextFunction,
    ): unknown;
  }

  interface SessionRouter
    extends Omit<Router, 'get' | 'post' | 'use' | 'delete'> {
    get(path: string, customCallback: CustomRequestCallback): void;
    post(
      path: string,
      customCallback: CustomRequestCallback,
      secondCallback?: CustomRequestCallback,
    ): void;
    use(
      path: string,
      customCallback:
        | CustomRequestCallback
        | Router
        | Application
        | SessionRouter,
      router?: Router | SessionRouter,
    ): void;
    delete(path: string, customCallback: CustomRequestCallback): void;
  }

  interface SessionRouteRequest extends ExpressRequest {
    sessionId: string;
    session: Session;
    sessionRequest: Pluma.Request;
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
      propertyName?: string;
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
    runScripts?: BaseOptions['runScripts'];
    unhandledPromptBehavior?: unhandledPromptBehavior;
    rejectPublicSuffixes?: boolean;
    strictSSL?: boolean;
    idleTimer?: boolean;
    maxIdleTime?: number;
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

  interface Proxy {
    proxyType?: string;
    proxyAutoConfigUrl?: string;
    ftpProxy?: string;
    httpProxy?: string;
    noProxy?: string[];
    sslProxy?: string;
    socksProxy?: string;
    socksVersion?: number;
  }

  interface SerializedWebElement {
    'element-6066-11e4-a52e-4f735466cecf': string;
  }

  type DOMWindow = Window | JSDOMDOMWindow;

  interface SessionConfig {
    value: {
      sessionId: string;
      capabilities: Capabilities;
    };
  }

  interface CommandHandler {
    (params: Request & { session: Session }): Promise<unknown>;
  }
}

declare global {
  interface MouseEventInit {
    which?: number;
  }

  interface Window {
    [k: string]: unknown;
    eval: typeof global.eval;
    HTMLElement: typeof HTMLElement;
    SVGElement: typeof SVGElement;
    NodeList: typeof NodeList;
    HTMLCollection: typeof HTMLCollection;
  }
}

declare module 'tough-cookie' {
  interface CookieJar {
    store: Store;
  }
}

export default Pluma;
