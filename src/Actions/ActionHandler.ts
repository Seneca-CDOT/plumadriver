import { Pluma } from '../Types/types';
import { InvalidArgument } from '../Error/errors';
import InputSourceContainer from '../Session/InputSourceContainer';

export class ActionHandler {
  private static processPointerParameters(
    parametersData,
  ): { pointerType: 'mouse' | 'pen' | 'touch' } {
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
    { type, id, parameter }: Pluma.InputSourceAction,
    inputSourceContainer: InputSourceContainer,
  ) {
    if (type !== 'key' && type !== 'pointer' && type !== 'none') {
      throw new InvalidArgument(
        'action type must be "key", "pointer", or "none".',
      );
    }

    if (typeof id !== 'string') {
      throw new InvalidArgument('id must be a string.');
    }

    const source = inputSourceContainer.findMatchingId(id);

    if (typeof source === 'undefined') {
      if (type === 'pointer') {
        const parameters = ActionHandler.processPointerParameters(parameter);
        inputSourceContainer.addInputSource({ id, type, parameters });
        // TODO: process pointer parameters with argument parametersData
      } else {
        inputSourceContainer.addInputSource({ id, type });
      }
    }
  }

  public static extractActionSequence(
    actions: Pluma.InputSourceAction[],
    inputSourceContainer: InputSourceContainer,
  ) {
    if (!Array.isArray(actions)) {
      throw new InvalidArgument('Action parameter must be an array.');
    }

    const actionsByTick: Pluma.Action[] = [];

    const InputSourceActions = actions.map(actionSequence =>
      ActionHandler.processInputSourceActionSequence(
        actionSequence,
        inputSourceContainer,
      ),
    );
  }
}
