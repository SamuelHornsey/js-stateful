# Javascript State Management

State management for your vanilla JS apps 📫

## Demo

View a demo here: [https://samuelhornsey.github.io/js-stateful/demo/](https://samuelhornsey.github.io/js-stateful/demo/)

## Installation

Installing using npm

```
npm install js-stateful
```

import as module.

```js
import Store from 'js-stateful'
```

## Usage

Setting up and creating the store

```js
import Store from 'js-stateful'

// Initial state
const state = {
  items: []
}

// Create an object containing mutations
const mutations = {
  ADD_ITEM: (state, action) => {
    state.items.push(action.item);

    return state;
  }
};

// Init the store
const store = new Store({ state, mutations, debug: true });
```

You can pass in a onChange handler. Everytime the state is changed this handler will be called.

```js
store.onChange(state => {
  console.log(state);
});
```

To modify the state use an action. These will call a specific mutation. The dispatch function on the store will create and commit the action.

```js
// Create an action function
const addItem = item => {
  return { type: "ADD_ITEM", item };
};

store.dispatch(addItem({ title: 'Hello, World' }));
```

To read the current state of the store simple use it like an other object.

```js
console.log(store.state);
```