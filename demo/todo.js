const addItem = item => {
  return { type: "ADD_ITEM", item };
};

const removeItem = item => {
  return { type: "REMOVE_ITEM", item };
};

const toggleDone = item => {
  return { type: "TOGGLE_DONE", item };
};

export default class Todo {
  /**
   * Constructor
   * @param {*} store 
   */
  constructor(store) {
    this.store = store;
    this.root = document.querySelector(".js-todo");
    this.store.onChange(() => this.render());

    window.addEventListener('popstate', e => this._pageChange(e));

    this.root.querySelector('.js-clear').addEventListener('click', (e) => this._clear());

    this._addItem();
    this._pageChange();
  }

  /**
   * Initialise
   */
  init() {
    this.render();
  }

  /**
   * Render
   */
  render() {
    const items = this.store.state.items.filter(el => {
      if (this.filter === 'default') {
        return el;
      }

      if (this.filter === 'completed') {
        if (el.complete == true) {
          return el;
        }
        return null;
      }

      if (this.filter === 'active') {
        if (el.complete == false || el.complete == null) {
          return el;
        }
        return null;
      }
    });

    let list = "";

    items.map((item, index) => {
      list =
        list +
        `
        <li data-id="${item.id}" class="${item.complete ? "completed" : ""}">
          <div class="view">
            <input class="toggle js-toggle" type="checkbox" ${
              item.complete ? "checked" : ""
            } />
              <label>${item.title}</label>
            <button class="destroy js-destory"></button>
          </div>
        </li>
      `;
    });

    if (this.store.state.items.length === 0) {
      this.root.querySelector(".js-footer").style.display = "none";
    } else {
      this.root.querySelector(".js-footer").style.display = "block";
      this.root.querySelector(".js-count").innerHTML = `${
        this.store.state.items.filter(
          val => val.complete == null || val.complete == false
        ).length
      } item left`;
    }

    this.root.querySelector(".js-list").innerHTML = list;
    this._toggleDone();
    this._removeButtons();
  }

  /**
   * Toggle an item
   */
  _toggleDone() {
    this.toggleBtns = this.root.querySelectorAll(".js-toggle");

    this.toggleBtns.forEach(btn => {
      btn.addEventListener("click", e => {
        const item = e.target.closest("li");

        if (item.getAttribute("data-id")) {
          this.store.dispatch(
            toggleDone({ id: parseInt(item.getAttribute("data-id")) })
          );
        }
      });
    });
  }

  /**
   * Add event listeners for remove buttons
   */
  _removeButtons() {
    this.removeBtns = this.root.querySelectorAll(".js-destory");

    this.removeBtns.forEach(btn => {
      btn.addEventListener("click", e => {
        const item = e.target.closest("li");

        if (item.getAttribute("data-id")) {
          this.store.dispatch(
            removeItem({ id: parseInt(item.getAttribute("data-id")) })
          );
        }
      });
    });
  }

  /**
   * Add item
   */
  _addItem() {
    this.input = this.root.querySelector(".js-input");

    this.input.addEventListener("keydown", e => {
      if (e.target.value === "") return;

      if (e.keyCode === 13) {
        this.store.dispatch(addItem({ title: e.target.value, id: this.store.state.items.length + 1 }));
        e.target.value = "";
      }
    });
  }

  /**
   * Change page
   */
  _pageChange () {
    const page = window.location.hash;
    this.root.querySelectorAll('.js-page').forEach(el => el.classList.remove('selected'));

    switch (page) {
      case '#/active':
        this.filter = 'active';
        this.root.querySelector('.js-active').classList.add('selected');
        break;
      case '#/completed':
        this.filter = 'completed';
        this.root.querySelector('.js-completed').classList.add('selected');
        break;
      default:
        this.filter = 'default';
        this.root.querySelector('.js-all').classList.add('selected');
        break;
    }

    this.render();
  }

  /**
   * Clear
   */
  _clear () {
    this.store.state.items.forEach(item => {
      if (item.complete) {
        this.store.dispatch(removeItem(item));
      }
    });
  }
}
