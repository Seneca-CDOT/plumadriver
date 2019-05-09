
const fs = require('fs');
const path = require('path');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { expect } = chai;
const should = chai.should();
const driver = require('../pluma-webdriver');

chai.use(chaiHttp);

module.exports.importTest = ({name, path}) => {
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
function populateTestList(filename,testList,...ignoreFiles) {

    const stats = fs.lstatSync(filename);
    let test = {};
    if (!stats.isDirectory()) {
        test = 
         !ignoreFiles.includes(path.basename(filename))
         ? { path: filename, name: path.basename(filename) }
         : null;
    } else {
        fs.readdirSync(filename).map(function (child) {
            return populateTestList(filename + '/' + child, testList, ignoreFiles)
        });
    }

    if (!isEmpty(test)) {
        test.path = './' + test.path.substr(5);
        testList.push(test);  
    }
}

module.exports.getTests = (filename,...ignoreFiles) => {
    const testList = [];
    populateTestList(filename, testList,...ignoreFiles);
    return testList;
}
