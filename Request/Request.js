
class Request {
  constructor(urlVariables, parameters, command, id) {
    this.urlVariables = urlVariables;
    this.parameters = parameters;
    this.command = command;
    this.id = id;
  }
}

module.exports = Request;
