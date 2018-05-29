import { $Node } from "./index";
import { $Element } from "../element/index";
import { $Document } from "../document/index";
import { MethodError } from "../errors";

/**
 * Clone element
 * @param  {Boolean} deepCopy `true` when all children should also be cloned, otherwise `false`
 * @return {$Node} A clone of the current element
 * @example
 * ul.clone(true);  // => clone of <ul> with all it's children
 * ul.clone(false); // => clone of <ul> element ONLY
 */
$Node.prototype.clone = function(deepCopy) {
    if (typeof deepCopy !== "boolean") {
        throw new MethodError("clone", arguments);
    }

    const node = this[0];

    if (node) {
        const clonedNode = node.cloneNode(deepCopy);

        if (this instanceof $Element) {
            return new $Element(clonedNode);
        } else if (this instanceof $Document) {
            return new $Document(clonedNode);
        }
    }

    return new $Node();
};
