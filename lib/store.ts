import Queue from "./queue";

// Action interface
interface Action {
  type: string;
  [key: string]: any
}

// Mutations interface
interface Mutations {
  [key: string]: Function;
}

// Parameters interface
interface Params {
  mutations: Mutations;
  state: object;
  debug?: boolean;
}

// Type status
type Status = "resting" | "mutation" | "action";

// Store object
export default class Store {
  // Private properties
  private queue: Queue;
  private status: Status;
  private mutations: Mutations;
  private debug: boolean;

  // Public properties
  public state: ProxyConstructor;

  /**
   * Constructor
   * @param params Params
   */
  constructor(params: Params) {
    this.queue = new Queue();
    this.status = "resting";

    // Set debug param
    this.debug = params.debug || false;

    // Add mutations from params
    if ("mutations" in params) {
      this.mutations = params.mutations;
    }

    // Create the state proxy
    this.state = this.createProxy(params.state);
  }

  /**
   * Create a proxy
   * @param state object
   */
  private createProxy(state?: object) {
    const set = (state: any, key: string, value: any): boolean => {
      // Set the state
      state[key] = value;

      this.debug
        ? console.log(`stateChange: { ${key}: ${JSON.stringify(value)} }`)
        : null;

      // Publish an event
      this.queue.publish("stateChange", this.state);

      // Warn if the user is not using a mutation
      if (this.status !== "mutation") {
        console.warn(`You should use a mutation to set ${key}`);
      }

      return true;
    };

    // return the new proxy
    return new Proxy(state || {}, { set });
  }

  /**
   * Commit the new state
   * @param newState object
   */
  private commit(newState: object) {
    this.status = "mutation";
    this.state = Object.assign(this.state, newState);
    this.status = "resting";
  }

  /**
   * Dispatch an action
   * @param action string
   * @param payload any
   */
  public dispatch(action: Action): boolean {
    // Error if the action type does not exit
    if (!(action.type in this.mutations)) {
      console.error(`Action ${action.type} does not exist`);
      return false;
    }

    this.debug ? console.groupCollapsed(`ACTION: ${action.type}`) : null;

    // Mutate the state and get new state
    this.status = "action";
    const newState = this.mutations[action.type]({ ...this.state }, action);

    // Commit the new state
    this.commit(newState);
    this.debug ? console.groupEnd() : null;

    return true;
  }

  /**
   * Handle on state change
   * @param handler Function
   */
  public onChange(handler: Function) {
    this.queue.subscribe("stateChange", handler);
  }
}
