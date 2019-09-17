const { JSDOM } = require('jsdom');
const { WebElement } = require('../../../build/WebElement/WebElement');
const path = require('path');
const PAGES = {
  RADIO: './pages/radio.html',
  DROPDOWN: './pages/dropdown.html',
};

const generateDom = async page =>
  await JSDOM.fromFile(path.join(__dirname, page));

describe('Radio Elements', () => {
  it('selects radio buttons', async () => {
    const {
      window: { document },
    } = await generateDom(PAGES.RADIO);

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

describe('Dropdown Elements', () => {
  it('selects a dropdown element', async () => {
    const {
      window: { document },
    } = await generateDom(PAGES.DROPDOWN);

    const firstOptionElement = document.querySelector('option[value="first"]');
    const secondOptionElement = document.querySelector('option[value="second"]');
    const firstOptionWebElement = new WebElement(firstOptionElement);
    
    firstOptionWebElement.click();
    expect(firstOptionElement.selected).toBe(true);
    expect(firstOptionWebElement.element.selected).toBe(true);
    expect(secondOptionElement.selected).toBe(false);
  });
});
