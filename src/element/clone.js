import { MethodError } from "../errors";
import { DOM2_EVENTS } from "../const";
import { $Element, DOM } from "../types";

/**
 * Clone element
 * @memberof! $Element#
 * @alias $Element#clone
 * @param {Boolean} [deep=true] <code>true</code> if all children should also be cloned, or <code>false</code> otherwise
 * @return {$Element} a clone of current element
 * @example
 * ul.clone();      // => clone of <ul> with all it's children
 * ul.clone(false); // => clone of <ul> element ONLY
 */
$Element.prototype.clone = function(deep = true) {
    if (typeof deep !== "boolean") throw new MethodError("clone");

    var node = this[0], result;

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
