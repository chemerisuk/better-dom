import { $Node } from "./index";
import { MethodError } from "../errors";
import EventHandler from "../util/eventhandler";
import { isArray } from "../util/index";

/**
 * Bind a DOM event listener
 * @param  {String} type Event type
 * @param  {Object|String} [options] Event options object or css selector to match on
 * @param  {Array} [args] Array of handler arguments to pass into the callback
 * @param  {Function} callback Event listener callback
 * @return {Function} Functor to cancel the listener
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
 * link.on("blur", {once: true}, function() {
 *     // event fired only once
 * });
 *
 * link.on("mousedown", {capture: true}, function() {
 *     // event fired on capturing phase
 * });
 */
$Node.prototype.on = function(type, options, args, callback) {
    if (typeof type === "string") {
        if (typeof options === "string") {
            options = {selector: options};
        } else if (typeof options === "function") {
            callback = options;
            options = {};
            args = [];
        } else if (typeof options === "object") {
            if (isArray(options)) {
                callback = args;
                args = options;
                options = {};
            }
        }

        if (typeof args === "function") {
            callback = args;
            args = [];
        }

        if (options && typeof options === "object" && typeof callback === "function") {
            const node = this[0];

            if (!node) return () => {};

            const handler = new EventHandler(this, node, options, args);
            handler.subscribe(type, callback);
            return () => handler.unsubscribe();
        }
    }

    throw new MethodError("on", arguments);
};
