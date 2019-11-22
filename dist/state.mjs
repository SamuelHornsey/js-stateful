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
    createProxy(state) {
        const config = {
            set: (state, key, value) => {
                state[key] = value;
                console.log(`stateChange: ${key}: ${value}`);
                this.queue.publish('stateChange', this.state);
                if (this.status !== 'mutation') {
                    console.warn(`You should use a mutation to set ${key}`);
                }
                this.status = 'resting';
                return true;
            }
        };
        return new Proxy((state || {}), config);
    }
    /**
     * Dispatch an action
     * @param action string
     * @param payload any
     */
    dispatch(action, payload) {
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
    commit(mutation, payload) {
        if (typeof this.mutations[mutation] !== 'function') {
            console.log(`Mutation ${mutation} does not exist`);
            return false;
        }
        this.status = 'mutation';
        const newState = this.mutations[mutation](this.state, payload);
        this.state = Object.assign(this.state, newState);
        return true;
    }
    /**
     * Subscribe to event
     * @param event string
     * @param handler Function
     */
    onChange(handler) {
        this.queue.subscribe('stateChange', handler);
    }
}

export default Store;
