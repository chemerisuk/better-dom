import { UNKNOWN_NODE } from "../const";

/**
 * Used to represent a node in better-dom
 * @class $Node
 */
export function $Node(node) {
    if (node) {
        this[0] = node;
        // use a generated property to store a reference
        // to the wrapper for circular object binding
        node["<%= prop() %>"] = this;
    }
}

$Node.prototype = {
    toString: () => "",
    valueOf: () => UNKNOWN_NODE // undefined
};
