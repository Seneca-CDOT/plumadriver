import { InvalidArgument } from '../Error/errors';

export default class Action {
  private id: string;
  private type: string;
  private subtype: string;

  constructor(id: string, type: string, subtype: string) {
    this.id = id;
    this.type = type;
    this.subtype = subtype;
  }

  public setDuration(duration: number): void {
    if (!Number.isInteger(duration) || duration < 0) {
      throw new InvalidArgument(
        `duration must be an integer greater than or equal to zero.`,
      );
    }
    this.duration = duration;
  }
}
