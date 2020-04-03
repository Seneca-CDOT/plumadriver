import Action from './Action';
import { InvalidArgument } from '../Error/errors';

class NullAction extends Action {
  private subtype: 'pause';
  private type = 'none';
  private id: string;

  constructor({ id, subtype }) {
    super();

    if (subtype !== 'pause') {
      throw new InvalidArgument(
        `Null action must have subtype "pause". Received ${subtype}`,
      );
    }

    this.id = this.subtype = subtype;
  }
}
