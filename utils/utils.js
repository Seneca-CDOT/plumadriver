
exports.validate = {
  checkRequestBodyType(incomingMessage, type) {
    if (incomingMessage.headers['content-type'].includes(type)) {
      console.log('bob');
      return true;
    }
    return false;
  },
};
