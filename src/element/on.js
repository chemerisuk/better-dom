import { register, isArray, keys } from "../util/index";
import { MethodError } from "../errors";
import { JSCRIPT_VERSION, RETURN_THIS } from "../const";
import EventHandler from "../util/eventhandler";

register({
    /**
     * Bind a DOM event
     * @memberof! $Element#
     * @alias $Element#on
     * @param  {String|Array}  type        event type(s) with optional selector
     * @param  {String}        [selector]  event selector filter
     * @param  {Array}         [args]      array of handler arguments to pass into the callback
     * @param  {Function}      callback    event callback
     * @return {$Element}
     * @function
     * @example
     * link.on("focus", function() {
     *     // do something on focus
     * });
     *
     * link.on("click", "i", function() {
     *     // do something on internal <i> click
     * });
     *
     * link.on("click", "span", ["currentTarget"], function(span) {
     *     // <span> is the element was clicked
     * });
     *
     * link.on(["focus", "blur"], function() {
     *     // you can pass several event types
     * });
     */
    on: false,

    /**
     * Bind a DOM event but fire once before being removed. Same as
     * {@link $Element#on}, but removes the handler after a first event
     * @memberof! $Element#
     * @alias $Element#once
     * @param  {String|Array}  type        event type(s) with optional selector
     * @param  {String}        [selector]  event selector filter
     * @param  {Array}         [args]      array of handler arguments to pass into the callback
     * @param  {Function}      callback    event callback
     * @return {$Element}
     * @function
     * @see $Element#on
     */
    once: true

}, (method, single) => function(type, selector, args, callback) {
    if (typeof type === "string") {
        if (typeof args === "function") {
            callback = args;

            if (typeof selector === "string") {
                args = null;
            } else {
                args = selector;
                selector = null;
            }
        }

        if (typeof selector === "function") {
            callback = selector;
            selector = null;
            args = null;
        }

        if (typeof callback !== "function") {
            throw new MethodError(method, arguments);
        }

        var node = this[0],
            handler = EventHandler(type, selector, callback, args, this, single),
            propName = "<%= prop('handler') %>";

        /* istanbul ignore if */
        if (JSCRIPT_VERSION < 9) {
            node.attachEvent("on" + (handler._type || type), handler);
        } else {
            node.addEventListener(handler._type || type, handler, !!handler.capturing);
        }
        // store event entry
        this._[propName] = this._[propName] || [];
        this._[propName].push(handler);
    } else if (typeof type === "object") {
        if (isArray(type)) {
            type.forEach((name) => { this[method](name, selector, args, callback) });
        } else {
            keys(type).forEach((name) => { this[method](name, type[name]) });
        }
    } else {
        throw new MethodError(method, arguments);
    }

    return this;
}, () => RETURN_THIS);
