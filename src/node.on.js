var _ = require("./utils"),
    $Node = require("./node"),
    EventHandler = require("./eventhandler"),
    features = require("./features"),
    hooks = {};

/**
 * Bind a DOM event
 * @param  {String|Array}    type event type(s) with optional selector
 * @param  {Function|String} callback event callback or property name (for late binding)
 * @param  {Array}           [props] array of event properties to pass into the callback
 * @return {$Node}
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.on = function(type, callback, props, /*INTERNAL*/once) {
    var eventType = typeof type,
        selector, index, args;

    if (eventType === "string") {
        index = type.indexOf(" ");

        if (~index) {
            selector = type.substr(index + 1);
            type = type.substr(0, index);
        }

        if (!Array.isArray(props)) {
            once = props;
            props = undefined;
        }
    } else if (eventType === "object") {
        if (Array.isArray(type)) {
            args = _.slice(arguments, 1);

            _.forEach(type, function(name) { this.on.apply(this, [name].concat(args)) }, this);
        } else {
            _.forOwn(type, function(value, name) { this.on(name, value) }, this);
        }

        return this;
    } else {
        throw _.makeError("on");
    }

    return this.legacy(function(node, el) {
        var handler = EventHandler(type, selector, callback, props, el, once),
            hook = hooks[type];

        handler.type = selector ? type + " " + selector : type;
        handler.callback = callback;

        if (hook) hook(handler);

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
 * @param  {String|Array}    type event type(s) with optional selector
 * @param  {Function|String} callback event callback or property name (for late binding)
 * @param  {Array}           [props] array of event properties to pass into the callback
 * @return {$Node}
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.once = function() {
    var args = _.slice(arguments);

    args.push(true);

    return this.on.apply(this, args);
};

// $Node.on hooks

if ("onfocusin" in document.createElement("a")) {
    _.forOwn({focus: "focusin", blur: "focusout"}, function(value, prop) {
        hooks[prop] = function(handler) { handler._type = value };
    });
} else {
    // firefox doesn't support focusin/focusout events
    hooks.focus = hooks.blur = function(handler) { handler.capturing = true };
}

if (document.createElement("input").validity) {
    hooks.invalid = function(handler) { handler.capturing = true };
}

module.exports = hooks;
