import { $Node } from "./index";
import { $Element } from "../element/index";
import { $Document } from "../document/index";
import { MethodError } from "../errors";

/**
 * Clone element
 * @param {Boolean} deep <code>true</code> if all children should also be cloned, or <code>false</code> otherwise
 * @return {$Node} a clone of the current element
 * @example
 * ul.clone(true);  // => clone of <ul> with all it's children
 * ul.clone(false); // => clone of <ul> element ONLY
 */
$Node.prototype.clone = function(deep) {
    if (typeof deep !== "boolean") {
        throw new MethodError("clone", arguments);
    }

    const node = this[0];

    if (node) {
        const clonedNode = node.cloneNode(deep);

        if (this instanceof $Element) {
            return new $Element(clonedNode);
        } else if (this instanceof $Document) {
            return new $Document(clonedNode);
        }
    }

    return new $Node();
};
