const { JSDOM } = require('jsdom');
const { WebElement } = require('../../../build/WebElement/WebElement');
const path = require('path');
const PAGES = {
  RADIO: './pages/radio.html',
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
