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
   * MDN: Proxy object enables you to create a proxy for another object,
   * which can intercept and redefine fundamental operations for that object.
   *
   * this is built in proxy to set `set` trap , so we can modify the existing
   * value inside the object or track any changes and set `get` trap , so we
   * can capture any use of state event , in Proxium this is very useful and
   * one of the important aspect inside the core concept.
   */
  _proxium.state = new Proxy(options.state || {}, {
    set: function (state, prop, value) {
      if (_proxium.activity === "settled") {
        state[prop] = value;
        events.emit("change");
      }
      _proxium.activity = "break";
    },
    get: function (state, prop, value) {
      events.emit("use");
      return state[prop];
    },
  });

  /**
   * use existing state
   * @param  {function} callback
   */
  _proxium.useState = (callback) => {
    callback(_proxium.state);
  };

  /**
   * capture any use of state
   * @param  {any} data
   * @param  {function} callback
   */
  _proxium.onUse = (data, callback) => {
    events.on("use", () => {
      callback(data);
    });
  };

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

  return _proxium;
};
