import { Pluma } from '../Types/types';
import { InvalidArgument } from '../Error/errors';

export class ActionHandler {
  private static processPointerParameters(parametersData) {
    
  }

  private static processInputSourceActionSequence(
    { type, id, source, parameter }: Pluma.Action,
    inputStateTable,
  ) {
    if (type !== 'key' && type !== 'pointer' && type !== 'none') {
      throw new InvalidArgument(
        'action type must be "key", "pointer", or "none".',
      );
    }

    if (typeof id !== 'string') {
      throw new InvalidArgument('id must be a string.');
    }

    if (type === 'pointer') {
      ActionHandler.processPointerParameters(parameter);
    }
  }

  public static extractActionSequence(
    actions: Pluma.Action[],
    inputStateTable,
  ): Pluma.Action[] {
    if (!Array.isArray(actions)) {
      throw new InvalidArgument('Action parameter must be an array.');
    }

    const actionsByTick: Pluma.Action[] = [];

    const InputSourceActions = actions.map(actionSequence =>
      ActionHandler.processInputSourceActionSequence(
        actionSequence,
        inputStateTable,
      ),
    );
  }
}
