class ActiveInputSourceContainer {
  private readonly activeInputs = [];

  public getActiveInputs() {
    return this.activeInputs;
  }

  public addInput(input) {
    this.activeInputs.push(input);
  }
}

const activeInputSourceContainer = new ActiveInputSourceContainer();

export default activeInputSourceContainer;
