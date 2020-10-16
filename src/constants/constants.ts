import StringUnion from '../utils/StringUnion';

/** Boolean attributes [WHATWG](https://html.spec.whatwg.org/#boolean-attribute) */
export const ElementBooleanAttributeValues = StringUnion(
  'async',
  'autocomplete',
  'autofocus',
  'autoplay',
  'border',
  'challenge',
  'checked',
  'compact',
  'contenteditable',
  'controls',
  'default',
  'defer',
  'disabled',
  'formNoValidate',
  'frameborder',
  'hidden',
  'indeterminate',
  'ismap',
  'loop',
  'multiple',
  'muted',
  'nohref',
  'noresize',
  'noshade',
  'novalidate',
  'nowrap',
  'open',
  'readonly',
  'required',
  'reversed',
  'scoped',
  'scrolling',
  'seamless',
  'selected',
  'sortable',
  'spellcheck',
  'translate',
);

/** W3C webdriver valid session [timeout types](https://w3c.github.io/webdriver/#timeouts) */
export const TimeoutValues = StringUnion('script', 'pageLoad', 'implicit');

/** W3C webdriver valid [unhandled prompt behavior](https://w3c.github.io/webdriver/#dfn-unhandled-prompt-behavior) values */
export const unhandledPromptBehaviorValues = StringUnion(
  'accept',
  'dismiss',
  'dismiss and notify',
  'accept and notify',
  'ignore',
);

/** W3C specific user agent [page loading strategies](https://w3c.github.io/webdriver/#dfn-page-loading-strategy) */
export const PageLoadStrategyValues = StringUnion('none', 'eager', 'normal');

/** [W3C web element identifier constant](https://w3c.github.io/webdriver/#elements) */
export const ELEMENT = 'element-6066-11e4-a52e-4f735466cecf';

/** Plumadriver specific commands. Used in Session.process and error handling */
export const COMMANDS = {
  DELETE_SESSION: 'DELETE SESSION',
  GET_TIMEOUTS: 'GET TIMEOUTS',
  SET_TIMEOUTS: 'SET TIMEOUTS',
  NAVIGATE_TO: 'NAVIGATE TO',
  GET_TITLE: 'GET TITLE',
  FIND_ELEMENT: 'FIND ELEMENT',
  FIND_ELEMENTS: 'FIND ELEMENTS',
  FIND_ELEMENT_FROM_ELEMENT: ' FIND ELEMENT FROM ELEMENT',
  FIND_ELEMENTS_FROM_ELEMENT: 'FIND ELEMENTS FROM ELEMENTS',
  GET_ELEMENT_TEXT: 'GET ELEMENT TEXT',
  GET_CURRENT_URL: 'GET CURRENT URL',
  GET_ALL_COOKIES: 'GET ALL COOKIES',
  ADD_COOKIE: 'ADD COOKIE',
  GET_ELEMENT_TAG_NAME: 'GET ELEMENT TAG NAME',
  GET_ELEMENT_ATTRIBUTE: 'GET ELEMENT ATTRIBUTE',
  GET_ELEMENT_PROPERTY: 'GET ELEMENT PROPERTY',
  EXECUTE_SCRIPT: 'EXECUTE SCRIPT',
  ELEMENT_SEND_KEYS: 'ELEMENT SEND KEYS',
  GET_NAMED_COOKIE: 'GET NAMED COOKIE',
  DELETE_COOKIE: 'DELETE COOKIE',
  DELETE_ALL_COOKIES: 'DELETE ALL COOKIES',
  ELEMENT_CLICK: 'ELEMENT_CLICK',
  ELEMENT_CLEAR: 'ELEMENT_CLEAR',
  ELEMENT_ENABLED: 'ELEMENT_ENABLED',
  ELEMENT_IS_DISPLAYED: 'ELEMENT_IS_DISPLAYED',
  GET_PAGE_SOURCE: 'GET_PAGE_SOURCE',
  GET_ACTIVE_ELEMENT: 'GET_ACTIVE_ELEMENT',
  SWITCH_TO_FRAME: 'SWITCH_TO_FRAME',
  SWITCH_TO_PARENT_FRAME: 'SWITCH_TO_PARENT_FRAME',
  ELEMENT_SELECTED: 'ELEMENT_SELECTED',
  GET_COMPUTED_LABEL: 'GET_COMPUTED_LABEL',
};
