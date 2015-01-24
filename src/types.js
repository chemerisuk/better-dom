function $NullElement() {}

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
            this._ = {
                "<%= prop('handler') %>": [],
                "<%= prop('watcher') %>": {},
                "<%= prop('extension') %>": [],
                "<%= prop('context') %>": {}
            };
        }
    } else if (node) {
        var cached = node["<%= prop() %>"];
        // create a wrapper only once for each native element
        return cached ? cached : new $Element(node);
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
    return $Element.call(this, node.documentElement);
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
