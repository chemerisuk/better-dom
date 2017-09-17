import { $Node } from "../node/index";

/**
 * Used to represent a document in better-dom
 * @class $Document
 * @extends {$Element}
 */
export function $Document(node) {
    if (this instanceof $Document) {
        $Node.call(this, node);
    } else if (node) {
        // create a wrapper only once for each native element
        return node["<%= prop() %>"] || new $Document(node);
    } else {
        return new $Document();
    }
}

const DocumentProto = new $Node();

$Document.prototype = DocumentProto;

DocumentProto.valueOf = () => function() {
    const node = this["<%= prop() %>"];

    return node ? 9 : 0; // Node.DOCUMENT_NODE;
};

DocumentProto.toString = () => "#document";
