import { StringUnion } from '../utils/utils';

export const ElementBooleanAttributeValues = StringUnion(
   'async'
  , 'autocomplete'
  , 'autofocus'
  , 'autoplay'
  , 'border'
  , 'challenge'
  , 'checked'
  , 'compact'
  , 'contenteditable'
  , 'controls'
  , 'default'
  , 'defer'
  , 'disabled'
  , 'formNoValidate'
  , 'frameborder'
  , 'hidden'
  , 'indeterminate'
  , 'ismap'
  , 'loop'
  , 'multiple'
  , 'muted'
  , 'nohref'
  , 'noresize'
  , 'noshade'
  , 'novalidate'
  , 'nowrap'
  , 'open'
  , 'readonly'
  , 'required'
  , 'reversed'
  , 'scoped'
  , 'scrolling'
  , 'seamless'
  , 'selected'
  , 'sortable'
  , 'spellcheck'
  , 'translate'
);

export const UnhandledPromptBehaviourValues = StringUnion(
  'accept'
  , 'dismiss'
  , 'dismiss and notify'
  , 'accept and notify'
  , 'ignore'
);

export const RunScriptsValues = StringUnion(
  'dangerously', 'outside-only', ''
);

// webelement identifier
export const ELEMENT = 'element-6066-11e4-a52e-4f735466cecf';

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
  EXECUTE_SCRIPT: 'EXECUTE SCRIPT',
  ELEMENT_SEND_KEYS: 'ELEMENT SEND KEYS',
};