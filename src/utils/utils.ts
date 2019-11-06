import { Pluma } from '../Types/types';
import * as PlumaError from '../Error/errors';
import * as fs from 'fs';

// credit where it's due: https://stackoverflow.com/questions/36836011/checking-validity-of-string-literal-union-type-at-runtime/43621735
export const StringUnion = <UnionType extends string>(
  ...values: UnionType[]
) => {
  Object.freeze(values);
  const valueSet: Set<string> = new Set(values);

  const guard = (value: string): value is UnionType => {
    return valueSet.has(value);
  };

  const check = (value: string): UnionType => {
    if (!guard(value)) {
      const actual = JSON.stringify(value);
      const expected = values.map(s => JSON.stringify(s)).join(' | ');
      throw new TypeError(
        `Value '${actual}' is not assignable to type '${expected}'.`,
      );
    }
    return value;
  };

  const unionNamespace = { guard, check, values };
  return Object.freeze(unionNamespace as typeof unionNamespace & {
    type: UnionType;
  });
};

export const isBrowserOptions = (obj: any): obj is Pluma.BrowserOptions => {
  if (
    obj.runScripts === undefined ||
    obj.strictSSL === undefined ||
    obj.unhandledPromptBehaviour === undefined ||
    obj.rejectPublicSuffixes === undefined
  )
    return false;
  return true;
};

export const validate = {
  requestBodyType(incomingMessage, type) {
    if (incomingMessage.headers['content-type'].includes(type)) {
      return true;
    }
    return false;
  },

  objectPropertiesAreInArray(object, array) {
    let validObject = true;

    Object.keys(object).forEach(key => {
      if (!array.includes(key)) validObject = false;
    });

    if (validObject && Object.keys(object).length > array.length)
      validObject = false;

    return validObject;
  },
  isEmpty(obj) {
    return Object.keys(obj).length === 0;
  },
};

export const fileSystem = {
  pathExists(path) {
    return new Promise((res, rej) => {
      fs.access(path, fs.constants.F_OK, err => {
        if (err) rej(new PlumaError.InvalidArgument());
        res(true);
      });
    });
  },
};

export const endpoint = {
  sessionEndpointExceptionHandler: (endpointLogic, plumaCommand) => async (
    req,
    res,
    next,
  ) => {
    req.sessionRequest.command = plumaCommand;
    const release = await req.session.mutex.acquire();
    endpointLogic(req, res)
      .catch(e => {
        e.command = req.sessionRequest.command;
        next(e);
      })
      .finally(() => {
        release();
      });
  },
  async defaultSessionEndpointLogic(req, res, additionalLogic = null) {
    let response = null;
    const result = await req.session.process(req.sessionRequest);
    if (result) {
      response = Object.prototype.hasOwnProperty.call(result, 'value')
        ? result
        : { value: result };
      res.json(response);
    } else {
      res.send(response);
    }
  },
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

export const isMutableFormControlElement = (element: HTMLElement): boolean => {
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
 * retrieves the domain in <secondLeveldomain>.<topLevelDomain> format
 * @returns {string}
 */
export const getDomainFromUrl = (url: string) => {
  const { hostname } = new URL(url);
  const hostnameComponents = hostname.split('.');
  const {
    [hostnameComponents.length - 1]: topLevelDomain,
    [hostnameComponents.length - 2]: secondLeveldomain,
  } = hostnameComponents;

  return `${secondLeveldomain}.${topLevelDomain}`;
};

export const isString = (candidateValue): boolean =>
  typeof candidateValue === 'string';

export const isBoolean = (candidateValue): boolean =>
  typeof candidateValue === 'boolean';
