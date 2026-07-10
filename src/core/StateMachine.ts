// core/StateMachine.ts
export interface IState<TContext = unknown> {
  enter(context: TContext): void;
  execute(context: TContext, delta: number): void;
  exit(context: TContext): void;
}

export class StateMachine<TContext> {
  private states = new Map<string, IState<TContext>>();
  private currentState?: IState<TContext>;
  private currentKey?: string;

  constructor(private readonly context: TContext) {}

  addState(key: string, state: IState<TContext>): this {
    this.states.set(key, state);
    return this;
  }

  transition(key: string): void {
    if (this.currentKey === key) return;
    const next = this.states.get(key);
    if (!next) throw new Error(`Unknown state: ${key}`);
    this.currentState?.exit(this.context);
    this.currentState = next;
    this.currentKey = key;
    this.currentState.enter(this.context);
  }

  update(delta: number): void {
    this.currentState?.execute(this.context, delta);
  }

  get state(): string | undefined {
    return this.currentKey;
  }
}
