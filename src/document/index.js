import { $Node } from "../node/index";

export function $NewDocument(node) {
    $Node.call(this, node);
}

const DocumentProto = new $Node();

$NewDocument.prototype = DocumentProto;

DocumentProto.valueOf = () => 9; // Node.DOCUMENT_NODE;
DocumentProto.toString = () => "#document";
