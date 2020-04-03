import { Pluma } from '../Types/types';

export default class InputSourceContainer {
  private readonly activeInputs = [];

  public getActiveInputs() {
    return this.activeInputs;
  }

  public addInputSource(inputSource: Pluma.InputSource) {
    this.activeInputs.push(inputSource);
  }

  public findMatchingId(id: string) {
    return this.activeInputs.find(activeInput => id === activeInput.id);
  }
}
