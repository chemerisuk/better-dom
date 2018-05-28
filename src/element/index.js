import { $Node } from "../node/index";
import { UNKNOWN_NODE, ELEMENT_NODE } from "../const";

/**
 * Used to represent an element in better-dom
 * @class $Element
 * @extends {$Node}
 */
export function $Element(node) {
    if (this instanceof $Element) {
        $Node.call(this, node);
    } else if (node) {
        // create a new wrapper or return existing object
        return node["<%= prop() %>"] || new $Element(node);
    } else {
        return new $Element();
    }
}

const ElementProto = new $Node();

$Element.prototype = ElementProto;

ElementProto.valueOf = function() {
    const node = this[0];
    return node ? ELEMENT_NODE : UNKNOWN_NODE;
};

ElementProto.toString = function() {
    const node = this[0];

    return node ? "<" + node.tagName.toLowerCase() + ">" : "#unknown";
};
