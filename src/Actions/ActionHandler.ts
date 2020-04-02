import { Pluma } from '../Types/types';
import { InvalidArgument } from '../Error/errors';

export class ActionHandler {
  private static processPointerParameters(parametersData) {
    const parameters = { pointerType: 'mouse' };

    if (typeof parametersData === 'undefined') {
      return parameters;
    }

    if (typeof parametersData !== 'object') {
      throw new InvalidArgument('Pointer parameters data must be an object.');
    }

    const { pointerType } = parametersData;

    if (typeof pointerType === 'undefined') {
      return parameters;
    }

    if (
      pointerType !== 'mouse' ||
      pointerType !== 'pen' ||
      pointerType !== 'touch'
    ) {
      throw new InvalidArgument('Pointer type must be mouse, pen, or touch.');
    }

    parameters.pointerType = pointerType;

    return parameters;
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
      const parametersData = ActionHandler.processPointerParameters(parameter);
      // TODO: process pointer parameters with argument parametersData
    }
  }

  public static extractActionSequence(
    actions: Pluma.Action[],
    inputStateTable,
  ) {
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
