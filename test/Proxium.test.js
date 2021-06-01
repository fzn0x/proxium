const Store = require("../src/proxium");
const assert = require("assert");
const fetch = require("node-fetch");

const store = Store({
  state: {
    number: 0,
    text: "",
  },
  events: {
    increment(state) {
      state.number++;
    },
    decrement(state) {
      state.number--;
    },
  },
  doings: {
    async increment({ state, deliver, does }, payload) {
      await deliver("asyncHello", {
        text: "Hello World",
      });
      deliver("hello");
      does("increment");
      does("increment");
      does("increment");
    },
    async asyncHello({ state }, { text }) {
      console.log(text);
      fetch("https://jsonplaceholder.typicode.com/todos/1")
        .then((response) => response.json())
        .then((json) => console.log(json.title));
    },
    hello({ state, onChange }) {
      onChange(state, () => {
        console.log("State Changed");
      });
    },
  },
});

describe("Proxium", () => {
  it("result is 3", async () => {
    await store.deliver("increment");
    assert.strictEqual(store.state.number, 3, "Expected result is 3");
  });
});
