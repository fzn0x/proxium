const EventEmitter = require("events");
const events = new EventEmitter();

module.exports = (options) => {
  const _proxium = this;

  Object.assign(_proxium, {
    state: options.state,
    events: options.events,
    doings: options.doings,
    activity: "break",
  });

  /**
   *
   */
  _proxium.state = new Proxy(options.state || {}, {
    set: function (state, key, value) {
      if (_proxium.activity === "settled") {
        state[key] = value;
        events.emit("change");
      }
      _proxium.activity = "break";
    },
  });

  /**
   * capture any changes inside state
   * @param  {any} data
   * @param  {function} callback
   */
  _proxium.onChange = (data, callback) => {
    events.on("change", () => {
      callback(data);
    });
  };

  /**
   * deliver any doings
   * @param  {string} doing
   * @param  {any} payload
   */
  _proxium.deliver = async (doing, payload) => {
    if (typeof _proxium.doings[doing] !== "function") {
      console.error(`Action "${doing}" doesn't exist!`);
    }

    _proxium.activity = "deliver";

    let action = _proxium.doings[doing];

    _proxium.isAsync(action)
      ? await action(_proxium, payload)
      : action(_proxium, payload);
  };

  /**
   * do any events
   * @param  {string} event
   */
  _proxium.does = (event) => {
    if (typeof _proxium.events[event] !== "function") {
      console.error(`Mutation "${event}" doesn't exist!`);
    }

    _proxium.activity = "settled";

    const newState = _proxium.events[event](_proxium.state);

    _proxium.state = Object.assign(_proxium.state, newState);
  };

  /**
   * check if action is async
   * @param  {function} definedFunction
   */
  _proxium.isAsync = (definedFunction) => {
    if (typeof definedFunction !== "function") {
      return false;
    }
    return definedFunction.constructor.name === "AsyncFunction";
  };

  // COMING SOON!!
  _proxium.vue = () => {};
  _proxium.react = () => {};
  _proxium.useState = () => {};

  return _proxium;
};
