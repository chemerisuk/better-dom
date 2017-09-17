function $NullElement() {
    this.length = 0;
}

/**
 * Used to represent an element in better-dom
 * @class $Element
 */
function $Element(node) {
    if (this instanceof $Element) {
        if (node) {
            // use a generated property to store a reference
            // to the wrapper for circular object binding
            node["<%= prop() %>"] = this;

            this[0] = node;
            this.length = 1;
            this._ = {};
        }
    } else if (node) {
        // create a wrapper only once for each native element
        return node["<%= prop() %>"] || new $Element(node);
    } else {
        return new $NullElement();
    }
}

$Element.prototype = {
    toString() {
        return "<" + this[0].tagName.toLowerCase() + ">";
    },
    version: "<%= pkg.version %>"
};

$NullElement.prototype = new $Element();
$NullElement.prototype.toString = () => "";

export { $Element, $NullElement };
