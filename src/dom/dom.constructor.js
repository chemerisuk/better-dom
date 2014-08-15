import { DOM, $Element } from "../types";

DOM.constructor = function(node) {
    if (!node || "nodeType" in node) {
        return new $Element(node && node.nodeType === 1 ? node : null);
    } else {
        return Array.prototype.map.call(node, $Element);
    }
};
