
exports.validate = {
  requestBodyType(incomingMessage, type) {
    if (incomingMessage.headers['content-type'].includes(type)) {
      return true;
    }
    return false;
  },
  type(testObj, type) {
    if (testObj.constructor.name.toLowerCase() === type) return true;
    return false;
  },
  objectPropertiesAreInArray(object, array) {
    let validProperty = true;

    Object.keys(object).forEach((key) => {
      if (!array.includes(key)) validProperty = false;
    });

    return validProperty;
  },
};
