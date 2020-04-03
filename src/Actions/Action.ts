export abstract class Action {
  abstract id;
  abstract type;
  abstract subtype;
  abstract execute();
}
