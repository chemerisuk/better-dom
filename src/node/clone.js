import { $Node } from "./index";
import { $NewElement } from "../element/index";
import { $NewDocument } from "../document/index";
import { MethodError } from "../errors";

/**
 * Clone element
 * @memberof! $Node#
 * @alias $Node#clone
 * @param {Boolean} deep <code>true</code> if all children should also be cloned, or <code>false</code> otherwise
 * @return {$Node} a clone of current element
 * @example
 * ul.clone();      // => clone of <ul> with all it's children
 * ul.clone(false); // => clone of <ul> element ONLY
 */
$Node.prototype.clone = function(deep) {
    if (typeof deep !== "boolean") {
        throw new MethodError("clone", arguments);
    }

    const node = this["<%= prop() %>"];
    const clonedNode = node ? node.cloneNode(deep) : null;

    if (this instanceof $NewElement) {
        return new $NewElement(clonedNode);
    } else if (this instanceof $NewDocument) {
        return new $NewDocument(clonedNode);
    } else {
        return new $Node();
    }
};
