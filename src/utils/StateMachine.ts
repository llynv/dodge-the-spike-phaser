export interface StateHandler<TState> {
  onEnter?: (previousState?: TState | undefined) => void;
  onUpdate?: (deltaTime: number) => void;
  onExit?: (nextState: TState) => void;
}

export interface StateMachineConfig<TState> {
  initialState: TState;
  validTransitions?: Map<TState, TState[]>;
  stateHandlers?: Map<TState, StateHandler<TState>>;
  enableLogging?: boolean;
}

export class StateMachine<TState> {
  private currentState: TState;
  private previousState: TState | undefined;
  private validTransitions: Map<TState, TState[]>;
  private stateHandlers: Map<TState, StateHandler<TState>>;
  private enableLogging: boolean;
  private stateChangeCallbacks: ((newState: TState, oldState?: TState | undefined) => void)[] = [];

  constructor(config: StateMachineConfig<TState>) {
    this.currentState = config.initialState;
    this.previousState = undefined;
    this.validTransitions = config.validTransitions || new Map();
    this.stateHandlers = config.stateHandlers || new Map();
    this.enableLogging = config.enableLogging || false;

    this.executeStateHandler('onEnter');
  }

  public getCurrentState(): TState {
    return this.currentState;
  }

  public getPreviousState(): TState | undefined {
    return this.previousState;
  }

  public canTransitionTo(newState: TState): boolean {
    if (!this.validTransitions.has(this.currentState)) {
      return true;
    }

    const allowedStates = this.validTransitions.get(this.currentState);
    return allowedStates ? allowedStates.includes(newState) : false;
  }

  public transitionTo(newState: TState, force: boolean = false): boolean {
    if (newState === this.currentState) {
      return false;
    }

    if (!force && !this.canTransitionTo(newState)) {
      if (this.enableLogging) {
        console.warn(`Invalid transition from ${this.currentState} to ${newState}`);
      }
      return false;
    }

    const oldState = this.currentState;

    this.executeStateHandler('onExit', newState);

    this.previousState = this.currentState;
    this.currentState = newState;

    this.executeStateHandler('onEnter', this.previousState);

    this.stateChangeCallbacks.forEach(callback => callback(newState, oldState));

    if (this.enableLogging) {
      console.log(`State transition: ${oldState} → ${newState}`);
    }

    return true;
  }

  public update(deltaTime: number): void {
    this.executeStateHandler('onUpdate', deltaTime);
  }

  public setStateHandler(state: TState, handler: StateHandler<TState>): void {
    this.stateHandlers.set(state, handler);
  }

  public addValidTransition(fromState: TState, toState: TState): void {
    if (!this.validTransitions.has(fromState)) {
      this.validTransitions.set(fromState, []);
    }
    const transitions = this.validTransitions.get(fromState)!;
    if (!transitions.includes(toState)) {
      transitions.push(toState);
    }
  }

  public addStateChangeCallback(
    callback: (newState: TState, oldState?: TState | undefined) => void
  ): void {
    this.stateChangeCallbacks.push(callback);
  }

  public removeStateChangeCallback(
    callback: (newState: TState, oldState?: TState | undefined) => void
  ): void {
    const index = this.stateChangeCallbacks.indexOf(callback);
    if (index !== -1) {
      this.stateChangeCallbacks.splice(index, 1);
    }
  }

  private executeStateHandler(method: keyof StateHandler<TState>, parameter?: any): void {
    const handler = this.stateHandlers.get(this.currentState);
    if (handler && handler[method]) {
      try {
        (handler[method] as Function)(parameter);
      } catch (error) {
        if (this.enableLogging) {
          console.error(`Error executing ${String(method)} for state ${this.currentState}:`, error);
        }
      }
    }
  }

  public reset(newInitialState?: TState): void {
    const targetState = newInitialState || this.currentState;
    this.executeStateHandler('onExit');
    this.previousState = undefined;
    this.currentState = targetState;
    this.executeStateHandler('onEnter');
  }

  public isInState(state: TState): boolean {
    return this.currentState === state;
  }

  public wasInState(state: TState): boolean {
    return this.previousState === state;
  }
}
