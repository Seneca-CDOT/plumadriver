import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import has from 'has';
import { version } from 'pjson';
import Pluma from '../Types/types';
import * as PlumaError from '../Error/errors';
import isDisplayedAtom from './isdisplayed-atom.json';
import { ELEMENT } from '../constants/constants';

export const isObject = (
  candidateValue: unknown,
): candidateValue is Record<string, unknown> => {
  return typeof candidateValue === 'object' && candidateValue !== null;
};

export const isBrowserOptions = (
  obj: Pluma.BrowserOptions,
): obj is Pluma.BrowserOptions => {
  if (
    obj.runScripts === undefined ||
    obj.strictSSL === undefined ||
    obj.unhandledPromptBehavior === undefined ||
    obj.rejectPublicSuffixes === undefined
  )
    return false;
  return true;
};

export const validate = {
  requestBodyType(incomingMessage: Request, type: string): boolean {
    if (incomingMessage.headers['content-type']?.includes(type)) {
      return true;
    }
    return false;
  },

  objectPropertiesAreInArray(
    object: Record<string, unknown>,
    array: string | string[],
  ): boolean {
    let validObject = true;

    Object.keys(object).forEach(key => {
      if (!array.includes(key)) validObject = false;
    });

    if (validObject && Object.keys(object).length > array.length)
      validObject = false;

    return validObject;
  },
  isEmpty(obj: Record<string, unknown>): boolean {
    return Object.keys(obj).length === 0;
  },
};

export const fileSystem = {
  pathExists(path = ''): Promise<boolean> {
    return new Promise((res, rej) => {
      fs.access(path, fs.constants.F_OK, err => {
        if (err) rej(new PlumaError.InvalidArgument());
        res(true);
      });
    });
  },
};

export const endpoint = {
  sessionEndpointExceptionHandler: (
    endpointLogic: (req: Request, res: Response) => Promise<unknown>,
    plumaCommand: string,
  ) => async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (req.sessionRequest) req.sessionRequest.command = plumaCommand;
    const release = await req.session?.mutex.acquire();
    endpointLogic(req, res)
      .catch((e: Pluma.Request) => {
        e.command = req.sessionRequest?.command || ' ';
        next(e);
      })
      .finally(() => {
        release?.();
      });
  },

  async defaultSessionEndpointLogic(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result =
      req.sessionRequest && (await req.session?.process(req.sessionRequest));
    res.json(
      isObject(result) && has(result, 'value') ? result : { value: result },
    );
  },
};

/**
 * Selenium uses the Execute Script Sync endpoint to check for isDisplayed.
 * This detects that request and forwards it to the appropriate W3C recommended endpoint.
 */
export const handleSeleniumIsDisplayedRequest = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (req.body.script === isDisplayedAtom) {
    const [
      { 'element-6066-11e4-a52e-4f735466cecf': elementId },
    ] = req.body.args;

    req.url = `/session/${req.params.sessionId}/element/${elementId}/displayed`;
    req.method = 'GET';
    next('route');
  } else {
    next();
  }
};

export const isInputElement = (
  element: HTMLElement,
): element is HTMLInputElement => {
  return element.tagName.toLowerCase() === 'input';
};

export const isTextAreaElement = (
  element: HTMLElement,
): element is HTMLTextAreaElement => {
  return element.tagName.toLowerCase() === 'textarea';
};

export const isEditableFormControlElement = (
  element: HTMLInputElement | HTMLTextAreaElement,
): boolean => {
  return !element.hidden && !element.readOnly && !element.disabled;
};

export const isMutableFormControlElement = (
  element: HTMLElement,
): element is HTMLInputElement | HTMLTextAreaElement => {
  let isMutable: boolean;

  if (isTextAreaElement(element)) {
    isMutable = isEditableFormControlElement(element);
  } else if (isInputElement(element)) {
    const mutableInputPattern = new RegExp(
      '^(text|search|url|tel|email|password|date|month|week|time|datetime-local|number|range|color|file)$',
    );
    isMutable =
      isEditableFormControlElement(element) &&
      mutableInputPattern.test(element.type);
  } else {
    isMutable = false;
  }

  return isMutable;
};

export const isMutableElement = (element: HTMLElement): boolean => {
  const {
    contentEditable,
    ownerDocument: { designMode },
  } = element;

  return contentEditable === 'true' || designMode === 'on';
};

/**
 * extracts the domain in <lowerLeveldomain>.<topLevelDomain> format
 * @returns {string}
 */
export const extractDomainFromUrl = (url: string): string => {
  return new URL(url).hostname;
};

export const isString = (candidateValue: unknown): candidateValue is string =>
  typeof candidateValue === 'string';

export const isBoolean = (candidateValue: unknown): candidateValue is boolean =>
  typeof candidateValue === 'boolean';

export const isNumber = (candidateValue: unknown): candidateValue is number =>
  typeof candidateValue === 'number';

// Expose the version in package.json
export const getVersion = (): string => `v${version}`;

export const isIframeElement = (
  element: HTMLElement,
): element is HTMLIFrameElement => {
  return element.localName === 'iframe';
};

export const isFrameElement = (
  element: HTMLElement,
): element is HTMLFrameElement => {
  return element.localName === 'frame';
};

export const isJsonWebElement = (
  value: unknown,
): value is { [ELEMENT]: string } =>
  isObject(value) && isString(value[ELEMENT]);

/** Work-around function for https://github.com/microsoft/TypeScript/issues/31445#issuecomment-576929044 */
export const copyProperty = <T>(target: T, src: T, prop: keyof T): void => {
  target[prop] = src[prop];
};
