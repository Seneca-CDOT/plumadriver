const { JSDOM } = require('jsdom');
const { WebElement } = require('../../build/WebElement/WebElement');
const path = require('path');
const PAGES = {
  RADIO: './pages/radio.html',
  SELECT: './pages/select.html',
  BUTTON: './pages/button.html',
  CHECKBOX: './pages/checkbox.html',
  CLEAR_FORM_CONTROL: './pages/clear-form-control.html',
};

const generateDom = async page =>
  await JSDOM.fromFile(path.join(__dirname, page), {
    runScripts: 'dangerously',
  });

describe('Click Functionality', () => {
  describe('Radio Elements', () => {
    it('selects radio buttons', async () => {
      const {
        window: { document },
      } = await generateDom(PAGES.RADIO);

      const [firstRadioButton, secondRadioButton] = document.querySelectorAll(
        'input[type="radio"]',
      );

      expect.assertions(3);
      const firstRadioElement = new WebElement(firstRadioButton);
      const secondRadioElement = new WebElement(secondRadioButton);
      firstRadioElement.click();
      expect(firstRadioButton.checked).toBe(true);
      secondRadioElement.click();
      expect(firstRadioButton.checked).toBe(false);
      expect(secondRadioButton.checked).toBe(true);
    });
  });

  describe('Checkbox Elements', () => {
    let document;

    beforeEach(async () => {
      const dom = await generateDom(PAGES.CHECKBOX);
      document = dom.window.document;
    });

    const tickAndVerify = (selector, isChecked) => {
      const checkbox = document.querySelector(selector);
      const webElement = new WebElement(checkbox);
      webElement.click();
      expect(checkbox.checked).toBe(isChecked);
    };

    it('ticks a checkbox', () => {
      tickAndVerify('#first', true);
    });

    it('unticks a checkbox', () => {
      tickAndVerify('#second', false);
    });
  });

  describe('Option Elements', () => {
    let document;

    beforeEach(async () => {
      const dom = await generateDom(PAGES.SELECT);
      document = dom.window.document;
    });

    const clickOptionAndEvaluate = (selector, expectedBoolean) => {
      expect.assertions(1);
      const multipleOption = document.querySelector(selector);
      const webElement = new WebElement(multipleOption);

      webElement.click();
      expect(multipleOption.selected).toBe(expectedBoolean);
    };

    it('selects a dropdown option element', () => {
      expect.assertions(3);

      const firstOptionElement = document.querySelector(
        'option[value="first"]',
      );
      const secondOptionElement = document.querySelector(
        'option[value="second"]',
      );
      const firstOptionWebElement = new WebElement(firstOptionElement);

      firstOptionWebElement.click();
      expect(firstOptionElement.selected).toBe(true);
      expect(firstOptionWebElement.element.selected).toBe(true);
      expect(secondOptionElement.selected).toBe(false);
    });

    it('selects an option element of type multiple', () => {
      clickOptionAndEvaluate('option[value="first-multiple"]', true);
    });

    it('unselects an option element of type multiple', () => {
      clickOptionAndEvaluate('option[value="second-multiple"]', false);
    });

    it('selects a nested option', () => {
      clickOptionAndEvaluate('#nested', true);
    });

    it('selects a datalist option', () => {
      clickOptionAndEvaluate('#datalist-option', true);
    });
  });

  describe('Button Elements', () => {
    let document;

    beforeEach(async () => {
      const dom = await generateDom(PAGES.BUTTON);
      document = dom.window.document;
    });

    it('fires event sequence: mouseover, mouseenter, mousemove, mousedown, mouseup, click', () => {
      const EVENT_SEQUENCE =
        'mouseover mouseenter mousemove mousedown mouseup click';
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
});

describe('Clear Functionality', () => {
  let document;

  beforeEach(async () => {
    const dom = await generateDom(PAGES.CLEAR_FORM_CONTROL);
    document = dom.window.document;
  });

  const clearAndVerify = (cssSelector, clearValue) => {
    const element = document.querySelector(cssSelector);
    const webElement = new WebElement(element);
    webElement.clear();
    expect(element.value).toEqual(clearValue);
  }

  it('clears an input of type text', () => {
    clearAndVerify('input[type="text"]', '');
  })
});
