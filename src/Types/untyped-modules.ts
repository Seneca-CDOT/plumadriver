declare module 'jsdom/lib/jsdom/living/helpers/focusing' {
  function isFocusableAreaElement(elImpl: unknown): boolean;
}

declare module 'jsdom/lib/jsdom/living/generated/utils' {
  // jsdom symbol on HTMLElement for private use
  const implSymbol: keyof HTMLElement;
}
