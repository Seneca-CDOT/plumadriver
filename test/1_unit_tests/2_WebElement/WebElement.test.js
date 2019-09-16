const { JSDOM } = require('jsdom');
const { WebElement } = require('../../../build/WebElement/WebElement');
const PAGES = {
  RADIOS: './pages/radios.html',
};
const path = require('path');

const generateDom = async page => {
  const dom = await JSDOM.fromFile(path.join(__dirname, page));
  return dom;
};

describe('Radio Elements', () => {
  it('checks a radio button', async () => {
    const {
      window: { document },
    } = await generateDom(PAGES.RADIOS);

    const radioButton = document.querySelector('input[type="radio"]');
    const radioElement = new WebElement(radioButton);
    radioElement.click();
    expect(radioButton.checked).toBe(true);
  });
});
