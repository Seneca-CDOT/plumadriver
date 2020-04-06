import { InvalidArgument } from '../Error/errors';
import { Pluma } from '../Types/types';

export default class Action {
  private id: string;
  private type: string;
  private subtype: string;
  private duration: number;
  private value: string;
  private pointerType: string;
  private button: number;
  private origin: HTMLElement | string;

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

  public setPointerType({ pointerType }: Pluma.PointerInputParameters): void {
    this.pointerType = pointerType;
  }

  public setButton(button: number): void {
    if (!Number.isInteger(button) || button < 0) {
      throw new InvalidArgument(
        `Button must be an integer greater or equal to 0. Received ${button}.`,
      );
    }

    this.button = button;
  }

  public setOrigin(origin: HTMLElement | string): void {
    if (typeof origin === 'undefined') {
      this.origin = 'viewport';
    } else if (
      origin !== 'viewport' &&
      origin !== 'pointer' &&
      !(origin instanceof HTMLElement)
    ) {
      throw new InvalidArgument(
        `Pointer move origin must be viewport, pointer, or an HTMLElement. Received ${origin}`,
      );
    } else {
      this.origin = origin;
    }
  }
}
