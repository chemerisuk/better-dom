import { $Node } from "../node/index";

export function $NewElement(node) {
    if (this instanceof $NewElement) {
        $Node.call(this, node);
    } else if (node) {
        // create a wrapper only once for each native element
        return node["<%= prop() %>"] || new $NewElement(node);
    } else {
        return new $NewElement();
    }
}

const ElementProto = new $Node();

$NewElement.prototype = ElementProto;

ElementProto.valueOf = () => function() {
    const node = this["<%= prop() %>"];

    return node ? 1 : 0; // Node.ELEMENT_NODE;
};

ElementProto.toString = function() {
    const node = this["<%= prop() %>"];

    return "<" + node.tagName.toLowerCase() + ">";
};
