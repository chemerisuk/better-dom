export function $Node(node) {
    if (node) {
        // use a generated property to store a reference
        // to the wrapper for circular object binding
        node["<%= prop() %>"] = this;
        this["<%= prop() %>"] = node;
    }
}

$Node.prototype = {
    toString: () => "",
    valueOf: () => 0 // undefined
};
