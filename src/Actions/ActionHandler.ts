import { Pluma } from '../Types/types';
import { InvalidArgument } from '../Error/errors';

export class ActionHandler {
  public static extractActionSequence(actions: Pluma.Action[]): Pluma.Action[] {
    if (!Array.isArray(actions)) {
      throw new InvalidArgument();
    }
  }
}
