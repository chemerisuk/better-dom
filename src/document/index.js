import { $Node } from "../node/index";
import { WINDOW, UNKNOWN_NODE, DOCUMENT_NODE, WEBKIT_PREFIX, FAKE_ANIMATION_NAME } from "../const";

const LIVE_EXTENSION_KEYFRAMES = "@" + WEBKIT_PREFIX + "keyframes " + FAKE_ANIMATION_NAME;
const LIVE_EXTENSION_KEYFRAMES_BODY = "from {opacity:.99} to {opacity:1}";

/**
 * Used to represent a document in better-dom
 * @class $Document
 * @extends {$Element}
 */
export function $Document(node) {
    if (this instanceof $Document) {
        $Node.call(this, node);
        // declare fake animation for live extensions
        WINDOW.setTimeout(() => {
            this.importStyles(LIVE_EXTENSION_KEYFRAMES, LIVE_EXTENSION_KEYFRAMES_BODY);
        }, 0);
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

    return node ? DOCUMENT_NODE : UNKNOWN_NODE;
};

DocumentProto.toString = () => "#document";
