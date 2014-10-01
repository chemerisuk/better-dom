import _ from "../util/index";
import { MethodError } from "../errors";
import { DOM2_EVENTS } from "../const";
import { $Element, $NullElement } from "../types";
import EventHandler from "../util/eventhandler";

var makeMethod = (method) => function(type, selector, props, callback) {
        if (typeof type === "string") {
            if (typeof props === "function") {
                callback = props;

                if (typeof selector === "string") {
                    props = null;
                } else {
                    props = selector;
                    selector = null;
                }
            }

            if (typeof selector === "function") {
                callback = selector;
                selector = null;
                props = null;
            }

            if (typeof callback !== "function") {
                throw new MethodError(method);
            }

            var node = this[0],
                handler = EventHandler(type, selector, callback, props, this, method === "once");

            if (handler) {
                if (DOM2_EVENTS) {
                    node.addEventListener(handler._type || type, handler, !!handler.capturing);
                } else {
                    node.attachEvent("on" + (handler._type || type), handler);
                }
                // store event entry
                this._._handlers.push(handler);
            }
        } else if (typeof type === "object") {
            if (_.isArray(type)) {
                type.forEach((name) => { this[method](name, selector, props, callback) });
            } else {
                _.keys(type).forEach((name) => { this[method](name, type[name]) });
            }
        } else {
            throw new MethodError(method);
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
         * @param  {Array}         [props]     array of event properties to pass into the callback
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
         * {@link $Element#on}, but removes the handler after a fist event
         * @memberof! $Element#
         * @alias $Element#once
         * @param  {String|Array}  type        event type(s) with optional selector
         * @param  {String}        [selector]  event selector filter
         * @param  {Array}         [props]     array of event properties to pass into the callback
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
