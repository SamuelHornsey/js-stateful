// Event interface
interface Events {
  [key: string]: Array<Function>;
}

// PubSub Queue
export default class Queue {
  private events: Events = {};

  /**
   * Subscribe to an event of type
   * @param event string
   * @param handler Function
   */
  public subscribe (event: string, handler: Function) : Queue {
    if (!(event in this.events)) {
      this.events[event] = [];
    }

    this.events[event].push(handler);

    return this;
  }

  /**
   * Publish an event on channel
   * @param event string
   * @param data object
   */
  public publish (event: string, data: object = {}) : Array<any> {
    if (!(event in this.events)) {
      return [];
    }

    return this.events[event].map(handler => handler(data));
  }
}