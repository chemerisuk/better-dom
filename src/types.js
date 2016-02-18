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

/**
 * Used to represent a document in better-dom
 * @class $Document
 * @extends {$Element}
 */
function $Document(node) {
    // use documentElement for a $Document wrapper
    return $Element.call(this, node);
}

$Element.prototype = {
    toString() {
        return "<" + this[0].tagName.toLowerCase() + ">";
    },
    version: "<%= pkg.version %>"
};

$NullElement.prototype = new $Element();
$NullElement.prototype.toString = () => "";

$Document.prototype = new $Element();
$Document.prototype.toString = () => "#document";

export { $Element, $NullElement, $Document };
