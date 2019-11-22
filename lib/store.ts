import Queue from './queue';

// Actions interface
interface Actions {
  [key: string]: Function
}

// Mutations interface
interface Mutations {
  [key: string]: Function
}

// Parameters interface
interface Params {
  mutations: Mutations;
  actions: Actions;
  state: object;
  debug?: boolean;
}

// Type status
type Status = 'resting' | 'mutation' | 'action';

// Store object
export default class Store {
  private queue: Queue;
  private status: Status;
  private mutations: Mutations;
  private actions: Actions;
  public state: ProxyConstructor;

  /**
   * Constructor
   * @param params Params
   */
  constructor (params: Params) {
    this.queue = new Queue();
    this.status = 'resting';

    if ('actions' in params) {
      this.actions = params.actions;
    }

    if ('mutations' in params) {
      this.mutations = params.mutations;
    }

    this.state = this.createProxy(params.state);
  }

  /**
   * Create a proxy
   * @param state object
   */
  private createProxy (state?: object) {
    const config = {
      set: (state: any, key: string, value: any) : boolean => {
        state[key] = value;

        console.log(`stateChange: ${key}: ${value}`);

        this.queue.publish('stateChange', this.state);

        if (this.status !== 'mutation') {
          console.warn(`You should use a mutation to set ${key}`);
        }

        this.status = 'resting';

        return true;
      }
    }

    return new Proxy((state || {}), config);
  }

  /**
   * Dispatch an action
   * @param action string
   * @param payload any
   */
  public dispatch (action: string, payload: any) : boolean {
    if (typeof this.actions[action] !== 'function') {
      console.error(`Action ${action} does not exist`);
      return false;
    }

    console.groupCollapsed(`ACTION: ${action}`);

    this.status = 'action';

    this.actions[action](this, payload);

    console.groupEnd();

    return true;
  }

  /**
   * Commit state to the store
   * @param mutation string
   * @param payload any
   */
  public commit (mutation: string, payload: any) : boolean {
    if (typeof this.mutations[mutation] !== 'function') {
      console.log(`Mutation ${mutation} does not exist`);
      return false;
    }

    this.status = 'mutation';

    const newState = this.mutations[mutation](this.state, payload);

    this.state = Object.assign(this.state, newState);

    return true;
  }
  
  public on (event: string, handler: Function) {
    this.queue.subscribe(event, handler);
  }
}