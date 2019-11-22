import Store from '../dist/state.mjs';

const state = {
  items: []
};

const mutations = {
  addItem (state, payload) {
    state.items.push(payload);

    return state;
  }
};

const actions = {
  addItem (context, payload) {
    context.commit('addItem', payload);
  }
};

const params = {
  mutations,
  actions,
  state
}

const store = new Store(params);

store.on('stateChange', state => console.log(state.items));

console.log(store);

store.dispatch('addItem', { user: 'Sam' });

setTimeout(() => {
  store.dispatch('addItem', { user: 'Sam' });
}, 1000);