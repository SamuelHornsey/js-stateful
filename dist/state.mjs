// PubSub Queue
class Queue {
    constructor() {
        this.events = {};
    }
    /**
     * Subscribe to an event of type
     * @param event string
     * @param handler Function
     */
    subscribe(event, handler) {
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
    publish(event, data = {}) {
        if (!(event in this.events)) {
            return [];
        }
        return this.events[event].map(handler => handler(data));
    }
}

// Store object
class Store {
    /**
     * Constructor
     * @param params Params
     */
    constructor(params) {
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
    createProxy(state) {
        const set = (state, key, value) => {
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
    commit(newState) {
        this.status = "mutation";
        this.state = Object.assign(this.state, newState);
        this.status = "resting";
    }
    /**
     * Dispatch an action
     * @param action string
     * @param payload any
     */
    dispatch(action) {
        // Error if the action type does not exit
        if (!(action.type in this.mutations)) {
            console.error(`Action ${action.type} does not exist`);
            return false;
        }
        this.debug ? console.groupCollapsed(`ACTION: ${action.type}`) : null;
        // Mutate the state and get new state
        this.status = "action";
        const newState = this.mutations[action.type](Object.assign({}, this.state), action);
        // Commit the new state
        this.commit(newState);
        this.debug ? console.groupEnd() : null;
        return true;
    }
    /**
     * Handle on state change
     * @param handler Function
     */
    onChange(handler) {
        this.queue.subscribe("stateChange", handler);
    }
}

export default Store;
