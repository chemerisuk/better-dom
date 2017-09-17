import { $Node } from "../node/index";

/**
 * Used to represent a document in better-dom
 * @class $Document
 * @extends {$Element}
 */
export function $NewDocument(node) {
    if (this instanceof $NewDocument) {
        $Node.call(this, node);
    } else if (node) {
        // create a wrapper only once for each native element
        return node["<%= prop() %>"] || new $NewDocument(node);
    } else {
        return new $NewDocument();
    }
}

const DocumentProto = new $Node();

$NewDocument.prototype = DocumentProto;

DocumentProto.valueOf = () => function() {
    const node = this["<%= prop() %>"];

    return node ? 9 : 0; // Node.DOCUMENT_NODE;
};

DocumentProto.toString = () => "#document";
