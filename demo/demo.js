import Store from '../dist/state.mjs';

const state = {
  items: []
};

const mutations = {
  'ADD_ITEM': (state, payload) => {
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

store.onChange(state => console.log(state.items));

console.log(store);

store.dispatch('addItem', { user: 'Sam' });

setTimeout(() => {
  store.dispatch('addItem', { user: 'Sam' });
}, 1000);