import { $Node } from "../node/index";
import { injectElement } from "../util/index";
import { UNKNOWN_NODE, DOCUMENT_NODE, WEBKIT_PREFIX, FAKE_ANIMATION_NAME, SHEET_PROP_NAME } from "../const";

// fake animation for live extensions
const STYLE_NODE_HTML = "@" + WEBKIT_PREFIX + "keyframes " + FAKE_ANIMATION_NAME + " {from {opacity:.99} to {opacity:1}}";

/**
 * Used to represent a document in better-dom
 * @class $Document
 * @extends {$Node}
 */
export function $Document(node) {
    if (this instanceof $Document) {
        // initialize state and all internal properties
        $Node.call(this, node);
        // add style element to append required css
        const styleNode = node.createElement("style");
        styleNode.innerHTML = STYLE_NODE_HTML;
        injectElement(styleNode);
        // store sheet object internally to use in importStyles later
        node[SHEET_PROP_NAME] = styleNode.sheet || styleNode.styleSheet;
    } else if (node) {
        // create a new wrapper or return existing object
        return node["<%= prop() %>"] || new $Document(node);
    } else {
        return new $Document();
    }
}

const DocumentProto = new $Node();

$Document.prototype = DocumentProto;

DocumentProto.valueOf = function() {
    const node = this[0];
    return node ? DOCUMENT_NODE : UNKNOWN_NODE;
};

DocumentProto.toString = () => "#document";
