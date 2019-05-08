process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');
const path = require('path');
const util = require('util');

const { expect } = chai;
const should = chai.should();
const driver = require('../pluma-webdriver');

chai.use(chaiHttp);

const tests = [];

function importTest({name, path}) {
    describe (name, function() {
        require(path);
    });
}

function isEmpty(obj) {
    for (let key in obj)
        if (obj.hasOwnProperty(key))
            return false;
    return true;
}

// stores test name and path in tests array 
function getTest(filename) {
    const stats = fs.lstatSync(filename);
    let test = {};
    if (!stats.isDirectory()) {
        test = 
         path.basename(filename) !== 'index.js'
         ? { path: filename, name: path.basename(filename) }
         : null;
    } else {
        fs.readdirSync(filename).map(function (child) {
            return getTest(filename + '/' + child)
        });
    }

    if (!isEmpty(test)) {
        test.path = './' + test.path.substr(5);
        tests.push(test);  
    } 
}

getTest('test');

describe("index.js", function() {
    this.timeout(10000)
    before(function () {

    });

    tests.forEach((test) => {
        importTest(test);
    });
});