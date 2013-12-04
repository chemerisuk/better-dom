var _ = require("./utils"),
    $Node = require("./node"),
    EventHandler = require("./eventhandler"),
    hooks = require("./node.on.hooks"),
    features = require("./features");

/**
 * Bind a DOM event to the context
 * @param  {String|Array}    type event type(s) with optional selector
 * @param  {Object}          [context] callback context
 * @param  {Function|String} callback event callback/property name
 * @param  {Array}           [props] array of event properties to pass into the callback
 * @return {$Node}
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.on = function(type, context, callback, props, /*INTERNAL*/once) {
    var eventType = typeof type,
        selector, index, args;

    if (eventType === "string") {
        index = type.indexOf(" ");

        if (~index) {
            selector = type.substr(index + 1);
            type = type.substr(0, index);
        }

        // handle optional context argument
        if (typeof context !== "object") {
            once = props;
            props = callback;
            callback = context;
            context = undefined;
        }

        if (typeof props !== "object") {
            once = props;
            props = undefined;
        }
    } else if (eventType === "object") {
        if (_.isArray(type)) {
            args = _.slice(arguments, 1);

            _.forEach(type, function(name) { this.on.apply(this, [name].concat(args)) }, this);
        } else {
            _.forOwn(type, function(value, name) { this.on(name, value) }, this);
        }

        return this;
    } else {
        throw _.makeError("on", this);
    }

    return this.legacy(function(node, el) {
        var hook, handler;

        if (once) {
            callback = (function(originalCallback) {
                return function() {
                    // remove event listener
                    el.off(handler.type, handler.context, callback);

                    return originalCallback.apply(el, arguments);
                };
            }(callback));
        }

        handler = EventHandler(type, selector, context, callback, props, el);
        handler.type = selector ? type + " " + selector : type;
        handler.callback = callback;
        handler.context = context || el;

        if (hook = hooks[type]) hook(handler);

        if (features.DOM2_EVENTS) {
            node.addEventListener(handler._type || type, handler, !!handler.capturing);
        } else {
            // IE8 doesn't support onscroll on document level
            if (el === DOM && type === "scroll") node = window;

            node.attachEvent("on" + (handler._type || type), handler);
        }
        // store event entry
        el._listeners.push(handler);
    });
};

/**
 * Bind a DOM event but fire once before being removed
 * @param  {String}   type type of event with optional selector to filter by
 * @param  {Array}    [props] event properties to pass to the callback function
 * @param  {Object}   [context] callback context
 * @param  {Function|String} callback event callback/property name
 * @return {$Node}
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.once = function() {
    var args = _.slice(arguments);

    args.push(true);

    return this.on.apply(this, args);
};
