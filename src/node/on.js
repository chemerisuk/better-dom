import { $Node } from "./index";
import { MethodError } from "../errors";
import EventHandler from "../util/eventhandler";

function makeMethod(methodName) {
    return function(type, selector, args, callback) {
        const single = methodName === "once";

        if (typeof type !== "string") {
            throw new MethodError(methodName, arguments);
        }

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
            throw new MethodError(methodName, arguments);
        }

        const node = this["<%= prop() %>"];

        if (node) {
            const handler = new EventHandler(this, node, args, callback);
            handler.subscribe(type, selector, !single ? callback : function() {
                handler.unsubscribe(); // stop callback on the first invokation

                return callback.apply(this, arguments);
            });
            return single ? this : () => handler.unsubscribe();
        }

        return single ? this : () => {};
    };
}

/**
 * Bind a DOM event
 * @memberof! $Element#
 * @alias $Element#on
 * @param  {String}        type        event type with optional selector
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
 */
$Node.prototype.on = makeMethod("on");

/**
 * Bind a DOM event but fire once before being removed. Same as
 * {@link $Element#on}, but removes the handler after a first event
 * @memberof! $Element#
 * @alias $Element#once
 * @param  {String}        type        event type with optional selector
 * @param  {String}        [selector]  event selector filter
 * @param  {Array}         [args]      array of handler arguments to pass into the callback
 * @param  {Function}      callback    event callback
 * @return {$Element}
 * @function
 * @see $Element#on
 */
$Node.prototype.once = makeMethod("once");
