
class Request {
  constructor(urlVariables, parameters, command) {
    this.urlVariables = urlVariables;
    this.parameters = parameters;
    this.command = command;
  }
}

module.exports = Request;
