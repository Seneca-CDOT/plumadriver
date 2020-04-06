import { InvalidArgument } from '../Error/errors';
import { Pluma } from '../Types/types';

export default class Action {
  private id: string;
  private type: string;
  private subtype: string;
  private duration: number;
  private value: string;
  private pointerType: string;

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

  public setValue(value: string): void {
    // TODO: validate that value is a single unicode code point
    this.value = value;
  }

  public setPointerType({ pointerType }: Pluma.PointerInputParameters) {
    this.pointerType = pointerType;
  }
}
