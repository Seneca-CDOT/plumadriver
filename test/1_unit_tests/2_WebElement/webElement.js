const chai = require('chai');
const { WebElement } = require('../../../build/WebElement/WebElement');
const { JSDOM } = require('jsdom');

const { expect } = chai;

function runTests(dom) {
    
    describe('Testing WebElement Class', () => {
        describe('Testing getText Method', () => {
            const webElement = new WebElement(dom.querySelector('#textWrapper'));
            const text = webElement.getText();
        
            it('Should return a string with no html markup', () => {
                expect(typeof text === 'string').to.be.true;
                expect(text.includes('</p>')).to.be.false;
            });
        });
        
        describe('Testing getTagName method', () => {
            const webElement = new WebElement(dom.querySelector("body"));
            const tagName = webElement.getTagName();
            it('Should return the string "body"', () => {
                expect(typeof tagName === 'string').to.be.true;
                expect(tagName.toLowerCase() === 'body').to.be.true;
            })
        });

        describe('Testing getElementAttribute method', () => {
            
        });
    });
}

JSDOM.fromFile('/home/miguel/projects/plumadriver/plumadriver/test_docs/index.html').then((jsdom) => {
    let dom = jsdom.window.document;
    runTests(dom);
});