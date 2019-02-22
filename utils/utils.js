
exports.validate = {
  requestBodyType(incomingMessage, type) {
    if (incomingMessage.headers['content-type'].includes(type)) {
      return true;
    }
    return false;
  },
};
