
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
};
