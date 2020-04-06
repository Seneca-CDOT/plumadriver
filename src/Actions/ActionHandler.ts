import { Pluma } from '../Types/types';
import { InvalidArgument } from '../Error/errors';
import Action from './Action';
import InputSourceContainer from '../Session/InputSourceContainer';

export default class ActionHandler {
  private static processPointerMoveAction(
    duration: number,
    x: number,
    y: number,
    origin: HTMLElement | string,
    action: Action,
  ): void {
    action.setDuration(duration);
    action.setOrigin(origin);
  }

  private static processPointerUpOrDownAction(
    button: number,
    action: Action,
  ): void {
    action.setButton(button);
  }

  private static processPointerAction(
    id: string,
    parameters: Pluma.PointerInputParameters,
    { type: subtype, duration, button, x, y, origin },
  ): Action {
    if (
      ![
        'pause',
        'pointerUp',
        'pointerDown',
        'pointerMove',
        'pointerCancel',
      ].includes(subtype)
    ) {
      throw new InvalidArgument(
        `Pointer Action must be of type "pause", "pointerUp", "pointerDown", "pointerMove", or "pointerCancel". Received ${subtype}`,
      );
    }

    const action: Action = new Action(id, 'pointer', subtype);

    if (subtype === 'pause') {
      return this.processPauseAction(duration, action);
    }

    action.setPointerType(parameters);

    if (subtype === 'pointerUp' || subtype === 'pointerDown') {
      ActionHandler.processPointerUpOrDownAction(button, action);
    }

    if (subtype === 'pointerMove') {
      ActionHandler.processPointerMoveAction(duration, x, y, origin, action);
    }
  }

  private static processKeyAction(
    id: string,
    { type: subtype, duration, value },
  ): Action {
    if (subtype !== 'keyUp' && subtype !== 'keyDown' && subtype !== 'pause') {
      throw new InvalidArgument(
        `Subtype for Key Action must be keyUp, keyDown, or pause. Received: ${subtype}`,
      );
    }

    const action = new Action(id, 'key', subtype);

    if (subtype === 'pause') {
      return ActionHandler.processPauseAction(duration, action);
    }

    action.setValue(value);
    return action;
  }

  private static processPauseAction(duration: number, action: Action): Action {
    action.setDuration(duration);
    return action;
  }

  private static processNullAction(id, { type: subtype, duration }): Action {
    if (subtype !== 'pause') {
      throw new InvalidArgument(
        `Subtype for Null Action must be "pause". Received: ${subtype}`,
      );
    }

    const nullAction: Action = new Action(id, 'none', subtype);

    return ActionHandler.processPauseAction(duration, nullAction);
  }

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
  ): Action[] {
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

    return actionItems.map(actionItem => {
      if (typeof actionItem !== 'object') {
        throw new InvalidArgument('Action item must be an object');
      }

      switch (type) {
        case 'none':
          return ActionHandler.processNullAction(id, actionItem);
        case 'key':
          return ActionHandler.processKeyAction(id, actionItem);

        case 'pointer':
          return ActionHandler.processPointerAction(
            id,
            parameterData,
            actionItem,
          );
        default:
          throw new InvalidArgument(
            `Type must be none, pointer, or key. Received ${type}.`,
          );
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
