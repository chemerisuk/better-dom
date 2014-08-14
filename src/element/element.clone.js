import { MethodError } from "../errors";
import { DOM2_EVENTS } from "../constants";
import { $Element, DOM } from "../types";

/**
 * Clone element
 * @memberof! $Element#
 * @alias $Element#clone
 * @param {Boolean} [deep=true] true if all children should also be cloned, or false otherwise
 * @return {$Element} clone of current element
 */
$Element.prototype.clone = function(deep = true) {
    if (typeof deep !== "boolean") throw new MethodError("clone");

    var node = this._._node, result;

    if (node) {
        if (DOM2_EVENTS) {
            result = new $Element(node.cloneNode(deep));
        } else {
            result = DOM.create(node.outerHTML);

            if (!deep) result.set("innerHTML", "");
        }
    } else {
        result = new $Element();
    }

    return result;
};
