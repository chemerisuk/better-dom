import _ from "../util/index";
import { MethodError } from "../errors";
import { JSCRIPT_VERSION } from "../const";
import { $Element, $NullElement } from "../types";
import EventHandler from "../util/eventhandler";

var makeMethod = (method) => function(type, selector, args, callback) {
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
                handler = EventHandler(type, selector, callback, args, this, method === "once");

            if (handler) {
                if (JSCRIPT_VERSION < 9) {
                    node.attachEvent("on" + (handler._type || type), handler);
                } else {
                    node.addEventListener(handler._type || type, handler, !!handler.capturing);
                }
                // store event entry
                this._._handlers.push(handler);
            }
        } else if (typeof type === "object") {
            if (_.isArray(type)) {
                type.forEach((name) => { this[method](name, selector, args, callback) });
            } else {
                _.keys(type).forEach((name) => { this[method](name, type[name]) });
            }
        } else {
            throw new MethodError(method, arguments);
        }

        return this;
    },
    methods = {
        /**
         * Bind a DOM event
         * @memberof! $Element#
         * @alias $Element#on
         * @param  {String|Array}  type        event type(s) with optional selector
         * @param  {String}        [selector]  event selector filter
         * @param  {Array}         [args]      array of handler arguments to pass into the callback
         * @param  {Function}      callback    event callback or property name (for late binding)
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
        on: makeMethod("on"),

        /**
         * Bind a DOM event but fire once before being removed. Same as
         * {@link $Element#on}, but removes the handler after a first event
         * @memberof! $Element#
         * @alias $Element#once
         * @param  {String|Array}  type        event type(s) with optional selector
         * @param  {String}        [selector]  event selector filter
         * @param  {Array}         [args]      array of handler arguments to pass into the callback
         * @param  {Function}      callback    event callback or property name (for late binding)
         * @return {$Element}
         * @function
         * @see $Element#on
         */
        once: makeMethod("once")
    };

_.assign($Element.prototype, methods);

_.keys(methods).forEach((methodName) => {
    $NullElement.prototype[methodName] = function() {
        return this;
    };
});
