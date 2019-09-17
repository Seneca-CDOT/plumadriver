const { JSDOM } = require('jsdom');
const { WebElement } = require('../../../build/WebElement/WebElement');
const path = require('path');
const PAGES = {
  RADIO: './pages/radio.html',
  SELECT: './pages/select.html',
  BUTTON: './pages/button.html',
};

const generateDom = async page =>
  await JSDOM.fromFile(path.join(__dirname, page), {
    runScripts: 'dangerously',
  });

describe('Radio Elements', () => {
  it('selects radio buttons', async () => {
    const {
      window: { document },
    } = await generateDom(PAGES.RADIO);

    expect.assertions(3);

    const [firstRadioButton, secondRadioButton] = document.querySelectorAll(
      'input[type="radio"]',
    );
    const firstRadioElement = new WebElement(firstRadioButton);
    const secondRadioElement = new WebElement(secondRadioButton);

    firstRadioElement.click();
    expect(firstRadioButton.checked).toBe(true);
    secondRadioElement.click();
    expect(firstRadioButton.checked).toBe(false);
    expect(secondRadioButton.checked).toBe(true);
  });
});

describe('Option Elements', () => {
  let document;

  beforeEach(async () => {
    const dom = await generateDom(PAGES.SELECT);
    document = dom.window.document;
  });

  const clickMultipleOptionAndEvaluate = (selector, expectedBoolean) => {
    expect.assertions(1);
    const multipleOption = document.querySelector(selector);
    const webElement = new WebElement(multipleOption);

    webElement.click();
    expect(multipleOption.selected).toBe(expectedBoolean);
  };

  it('selects a dropdown option element', async () => {
    expect.assertions(3);

    const firstOptionElement = document.querySelector('option[value="first"]');
    const secondOptionElement = document.querySelector(
      'option[value="second"]',
    );
    const firstOptionWebElement = new WebElement(firstOptionElement);

    firstOptionWebElement.click();
    expect(firstOptionElement.selected).toBe(true);
    expect(firstOptionWebElement.element.selected).toBe(true);
    expect(secondOptionElement.selected).toBe(false);
  });

  it('selects an option element of type multiple', async () => {
    const SELECTOR = 'option[value="first-multiple"]';
    const EXPECTED_OUTCOME = true;
    clickMultipleOptionAndEvaluate(SELECTOR, EXPECTED_OUTCOME);
  });

  it('unselects an option element of type multiple', async () => {
    const SELECTOR = 'option[value="second-multiple"]';
    const EXPECTED_OUTCOME = false;
    clickMultipleOptionAndEvaluate(SELECTOR, EXPECTED_OUTCOME);
  });

  it('selects a nested option', async () => {
    const SELECTOR = '#nested';
    const EXPECTED_OUTCOME = true;
    clickMultipleOptionAndEvaluate(SELECTOR, EXPECTED_OUTCOME);
  });

  it('selects a datalist option', () => {
    const SELECTOR = '#datalist-option';
    const EXPECTED_OUTCOME = true;
    clickMultipleOptionAndEvaluate(SELECTOR, EXPECTED_OUTCOME);
  });
});

describe('Button Elements', () => {
  let document;

  beforeEach(async () => {
    const dom = await generateDom(PAGES.BUTTON);
    document = dom.window.document;
  });

  it('fires event sequence: mouseover, mousedown, mouseup, and click', () => {
    const EVENT_SEQUENCE = 'mouseover mousedown mouseup click';
    const button = document.querySelector('#enabled');
    const eventLog = document.querySelector('#event-log');
    const webElement = new WebElement(button);

    webElement.click();
    expect(eventLog.textContent).toEqual(EVENT_SEQUENCE);
  });

  it('should not fire events on a disabled button', () => {
    const button = document.querySelector('#disabled');
    const eventLog = document.querySelector('#event-log');
    const webElement = new WebElement(button);

    webElement.click();
    expect(eventLog.textContent).toEqual('');
  });
});
