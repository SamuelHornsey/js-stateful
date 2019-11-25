import Store from "../dist/state.mjs";
import Todo from "./todo.js";

(() => {
  const state = {
    items: []
  };

  const mutations = {
    ADD_ITEM: (state, action) => {
      state.items.push(action.item);

      return state;
    },
    REMOVE_ITEM: (state, action) => {
      const { item } = action;

      state.items = state.items.filter((val) => (val.id !== item.id));

      return state;
    },
    TOGGLE_DONE: (state, action) => {
      const { item } = action;

      state.items = state.items.map((val) => {
        if (val.id === item.id) {
          val.complete = !val.complete;
        }

        return val;
      });

      return state;
    }
  };

  const store = new Store({ state, mutations, debug: true });

  const todo = new Todo(store);

  todo.init();
})();