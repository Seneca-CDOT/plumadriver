const fs = require('fs');
const path = require('path');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

module.exports.importTest = ({ name, path }) => {
  describe(name, () => {
    require(path);
  });
};

function isEmpty(obj) {
  let empty = true;
  Object.keys(obj).forEach((key) => {
    if ({}.hasOwnProperty.call(obj, key)) empty = false;
  });
  return empty;
}

// stores test name and path in tests array
function populateTestList(filename, testList, ...ignoreFiles) {
  const stats = fs.lstatSync(filename);
  let test = {};
  if (!stats.isDirectory()) {
    test = !ignoreFiles.includes(path.basename(filename))
      ? { path: filename, name: path.basename(filename) }
      : null;
  } else {
    fs.readdirSync(filename).map(child => populateTestList(`${filename}/${child}`, testList, ignoreFiles));
  }

  if (!isEmpty(test)) {
    test.path = `./${test.path.substr(5)}`;
    testList.push(test);
  }
}

module.exports.getTests = (filename, ...ignoreFiles) => {
  const testList = [];
  populateTestList(filename, testList, ...ignoreFiles);
  return testList;
};
