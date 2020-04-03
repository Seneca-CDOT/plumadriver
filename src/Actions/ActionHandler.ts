import { Pluma } from '../Types/types';
import { InvalidArgument } from '../Error/errors';
import InputSourceContainer from '../Session/InputSourceContainer';

export class ActionHandler {
  private static processPointerParameters(
    parametersData,
  ): Pluma.PointerInputParameters {
    const parameters: Pluma.PointerInputParameters = { pointerType: 'mouse' };

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
    inputSourceAction: Pluma.InputSourceAction,
    inputSourceContainer: InputSourceContainer,
  ): Pluma.InputSourceAction {
    const { type, id, parameters, actions: actionItems } = inputSourceAction;

    if (type !== 'key' && type !== 'pointer' && type !== 'none') {
      throw new InvalidArgument(
        `Action type ${type} does not match "key", "pointer", or "none".`,
      );
    }

    if (typeof id !== 'string') {
      throw new InvalidArgument('id must be a string.');
    }

    const source = inputSourceContainer.findMatchingId(id);

    let parameterData: Pluma.PointerInputParameters;

    if (typeof source === 'undefined') {
      const inputSource: Pluma.InputSource = { id, type };

      if (type === 'pointer') {
        parameterData = ActionHandler.processPointerParameters(parameters);
        inputSource.parameters = parameterData;
        // TODO: process pointer parameters with argument parametersData
      }

      inputSourceContainer.addInputSource(inputSource);
      // TODO: create input state table and add to it
    }

    if (source.type !== type) {
      throw new InvalidArgument(
        `Source type ${source.type} does not match expected type ${type}.`,
      );
    }

    if (!Array.isArray(actionItems)) {
      throw new InvalidArgument('Action items must be an array.');
    }

    const actions = actionItems.map(actionItem => {
      if (typeof actionItem !== 'object') {
        throw new InvalidArgument('Action item must be an object');
      }

      switch (type) {
        case 'none':
          ActionHandler.processNullAction(id, actionItem);
          break;
        case 'key':
          ActionHandler.processKeyAction(id, actionItem);
          break;
        case 'pointer':
          ActionHandler.processPointerAction(id, parameterData, actionItem);
          break;
      }
    });
  }

  public static extractActionSequence(
    actions: Pluma.InputSourceAction[],
    inputSourceContainer: InputSourceContainer,
  ) {
    if (!Array.isArray(actions)) {
      throw new InvalidArgument('Action parameter must be an array.');
    }

    const actionsByTick: Pluma.Action[] = [];

    const InputSourceActions: Pluma.InputSourceAction[] = actions.map(
      actionSequence =>
        ActionHandler.processInputSourceActionSequence(
          actionSequence,
          inputSourceContainer,
        ),
    );

    InputSourceActions.forEach((inputSourceAction, i) => {
      if (actionsByTick.length < i + 1) {
      }
    });
  }
}
