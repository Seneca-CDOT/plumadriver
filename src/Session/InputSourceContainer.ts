export default class InputSourceContainer {
  private readonly activeInputs = [];

  public getActiveInputs() {
    return this.activeInputs;
  }

  public addInput(input) {
    this.activeInputs.push(input);
  }
}
