import { computeStyle } from "../util/index";

var isHidden = (node) => {
    var computed = computeStyle(node);

    return computed.visibility === "hidden" || computed.display === "none";
};

export default {
    ":focus": (node) => node === node.ownerDocument.activeElement,

    ":visible": (node) => !isHidden(node),

    ":hidden": isHidden
};
