import { $Node } from "./index";
import { MethodError } from "../errors";
import { RETURN_THIS } from "../const";

/**
 * Unbind an event from the element
 * @memberof! $Element#
 * @alias $Element#off
 * @param  {String}          type        type of event
 * @param  {String}          [selector]  event selector
 * @param  {Function|String} [callback]  event handler
 * @return {$Element}
 * @example
 * link.off("focus", focusHandler);
 * // removes click for a particular selector
 * link.off("focus", "i", focusHandler);
 * // removes ALL click handlers
 * link.off("click");
 */
$Node.prototype.off = function(type, selector, callback) {
    if (typeof type !== "string") throw new MethodError("off", arguments);

    if (callback === void 0) {
        callback = selector;
        selector = void 0;
    }

    var node = this["<%= prop() %>"],
        propName = "<%= prop('handler') %>";

    if (node && this[propName]) {
        this[propName] = this[propName].filter((handler) => {
            var skip = type !== handler.type;

            skip = skip || selector && selector !== handler.selector;
            skip = skip || callback && callback !== handler.callback;

            if (skip) return true;

            type = handler._type || handler.type;

            node.removeEventListener(type, handler, !!handler.capturing);
        });
    }

    return this;
};
