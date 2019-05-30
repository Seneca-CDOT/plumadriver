import { ElementBooleanAttribute } from '../constants/constants';
import { ResourceLoader } from 'jsdom';

export type RunScripts = 'dangerously' | 'outside-only' | '' | null;
export type UnhandledPromptBehaviour =
  | 'accept'
  | 'dismiss'
  | 'dismiss and notify'
  | 'accept and notify'
  | 'ignore';
export type BeforeParse = (message?: string) => void;

export type ElementBooleanAttribute = typeof ElementBooleanAttribute.type;

export interface BrowserOptions {
  runScripts: RunScripts;
  strictSSL: Boolean;
  unhandledPromptBehaviour: UnhandledPromptBehaviour;
}
