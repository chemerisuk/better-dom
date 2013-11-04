var _ = require("./utils"),
    $Node = require("./node"),
    EventHandler = require("./eventhandler"),
    hooks = require("./node.on.hooks");

/**
 * Bind a DOM event to the context
 * @param  {String}   type event type with optional selector
 * @param  {Array}    [props] event properties to pass to the callback function
 * @param  {Object}   [context] callback context
 * @param  {Function|String} callback event callback/property name
 * @return {$Node}
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.on = function(type, props, context, callback, /*INTERNAL*/once) {
    var eventType = typeof type,
        selector, index;

    if (eventType === "string") {
        index = type.indexOf(" ");

        if (~index) {
            selector = type.substr(index + 1);
            type = type.substr(0, index);
        }

        // handle optional props argument
        if (Object.prototype.toString.call(props) !== "[object Array]") {
            once = callback;
            callback = context;
            context = props;
            props = undefined;
        }

        // handle optional context argument
        if (typeof context !== "object") {
            once = callback;
            callback = context;
            context = undefined;
        }
    }

    return _.legacy(this, function(node, el) {
        var hook, handler;

        if (eventType === "string") {
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

            if (document.addEventListener) {
                node.addEventListener(handler._type || type, handler, !!handler.capturing);
            } else {
                // IE8 doesn't support onscroll on document level
                if (el === DOM && type === "scroll") node = window;

                node.attachEvent("on" + (handler._type || type), handler);
            }
            // store event entry
            el._listeners.push(handler);
        } else if (eventType === "object") {
            _.forOwn(type, function(value, name) { el.on(name, value) });
        } else {
            throw _.makeError("on", el);
        }
    });
};

/**
 * Bind a DOM event to the context and the callback only fire once before being removed
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
