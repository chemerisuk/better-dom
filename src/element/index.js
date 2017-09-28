import { $Node } from "../node/index";
import { UNKNOWN_NODE, ELEMENT_NODE } from "../const";

export function $Element(node) {
    if (this instanceof $Element) {
        $Node.call(this, node);
    } else if (node) {
        // create a wrapper only once for each native element
        return node["<%= prop() %>"] || new $Element(node);
    } else {
        return new $Element();
    }
}

const ElementProto = new $Node();

$Element.prototype = ElementProto;

ElementProto.valueOf = function() {
    const node = this["<%= prop() %>"];
    return node ? ELEMENT_NODE : UNKNOWN_NODE;
};

ElementProto.toString = function() {
    const node = this["<%= prop() %>"];

    return node ? "<" + node.tagName.toLowerCase() + ">" : "#unknown";
};
