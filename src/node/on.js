import { $Node } from "./index";
import { MethodError } from "../errors";
import EventHandler from "../util/eventhandler";
import { isArray } from "../util/index";

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
$Node.prototype.on = function(type, options, args, callback) {
    if (typeof type === "string") {
        if (typeof options === "string") {
            options = {selector: options};

            if (isArray(args)) {
                options.args = args;
            } else {
                callback = args;
            }
        } else if (typeof options === "function") {
            callback = options;
            options = {};
        } else if (typeof options === "object") {
            callback = args;

            if (isArray(options)) {
                options = {args: options};
            }
        }

        if (options && typeof options === "object" && typeof callback === "function") {
            const node = this["<%= prop() %>"];

            if (!node) return () => {};

            const handler = new EventHandler(this, node, options);
            handler.subscribe(type, callback);
            return () => handler.unsubscribe();
        }
    }

    throw new MethodError("on", arguments);
};
