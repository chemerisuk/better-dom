import { $Node } from "../node/index";

export function $NewElement(node) {
    $Node.call(this, node);
}

const ElementProto = new $Node();

$NewElement.prototype = ElementProto;

ElementProto.valueOf = () => 1; // Node.ELEMENT_NODE;
ElementProto.toString = function() {
    const node = this["<%= prop() %>"];

    return "<" + node.tagName.toLowerCase() + ">";
};
