import { COMMANDS } from '../../constants/constants';
import addCookie from './add-cookie';
import deleteAllCookies from './delete-all-cookies';
import deleteCookie from './delete-cookie';
import deleteSession from './delete-session';
import elementClick from './element-click';
import elementSendKeys from './element-send-keys';
import executeScript from './execute-script';
import findElement from './find-element';
import findElementFromElement from './find-element-from-element';
import findElements from './find-elements';
import findElementsFromElement from './find-elements-from-element';
import getAllCookies from './get-all-cookies';
import getCurrentUrl from './get-current-url';
import getElementAttribute from './get-element-attribute';
import getElementTagName from './get-element-tag-name';
import getElementText from './get-element-text';
import getNamedCoookie from './get-named-cookie';
import getTimeouts from './get-timeouts';
import getTitle from './get-title';
import navigateTo from './navigate-to';
import setTimeouts from './set-timeouts';
import elementClear from './element-clear';
import elementEnabled from './element-enabled';
import elementIsDisplayed from './element-is-displayed';
import elementSelected from './element-selected';
import getPageSource from './get-page-source';
import getActiveElement from './get-active-element';
import switchToFrame from './switch-to-frame';
import switchToParentFrame from './switch-to-parent-frame';
import getElementProperty from './get-element-property';
import getComputedLabel from './get-computed-label'

export default {
  [COMMANDS.DELETE_SESSION]: deleteSession,
  [COMMANDS.NAVIGATE_TO]: navigateTo,
  [COMMANDS.GET_CURRENT_URL]: getCurrentUrl,
  [COMMANDS.GET_TITLE]: getTitle,
  [COMMANDS.FIND_ELEMENT]: findElement,
  [COMMANDS.FIND_ELEMENTS]: findElements,
  [COMMANDS.GET_ELEMENT_TEXT]: getElementText,
  [COMMANDS.FIND_ELEMENTS_FROM_ELEMENT]: findElementsFromElement,
  [COMMANDS.FIND_ELEMENT_FROM_ELEMENT]: findElementFromElement,
  [COMMANDS.SET_TIMEOUTS]: setTimeouts,
  [COMMANDS.GET_TIMEOUTS]: getTimeouts,
  [COMMANDS.GET_ALL_COOKIES]: getAllCookies,
  [COMMANDS.ADD_COOKIE]: addCookie,
  [COMMANDS.GET_NAMED_COOKIE]: getNamedCoookie,
  [COMMANDS.DELETE_COOKIE]: deleteCookie,
  [COMMANDS.DELETE_ALL_COOKIES]: deleteAllCookies,
  [COMMANDS.GET_ELEMENT_TAG_NAME]: getElementTagName,
  [COMMANDS.GET_ELEMENT_ATTRIBUTE]: getElementAttribute,
  [COMMANDS.GET_ELEMENT_PROPERTY]: getElementProperty,
  [COMMANDS.EXECUTE_SCRIPT]: executeScript,
  [COMMANDS.ELEMENT_SEND_KEYS]: elementSendKeys,
  [COMMANDS.ELEMENT_CLICK]: elementClick,
  [COMMANDS.ELEMENT_CLEAR]: elementClear,
  [COMMANDS.ELEMENT_ENABLED]: elementEnabled,
  [COMMANDS.ELEMENT_IS_DISPLAYED]: elementIsDisplayed,
  [COMMANDS.GET_PAGE_SOURCE]: getPageSource,
  [COMMANDS.GET_ACTIVE_ELEMENT]: getActiveElement,
  [COMMANDS.SWITCH_TO_FRAME]: switchToFrame,
  [COMMANDS.SWITCH_TO_PARENT_FRAME]: switchToParentFrame,
  [COMMANDS.ELEMENT_SELECTED]: elementSelected,
  [COMMANDS.GET_COMPUTED_LABEL]: getComputedLabel,
};
