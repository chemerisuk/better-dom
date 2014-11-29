import _ from "../util/index";

var isHidden = (node) => {
    var computed = _.computeStyle(node);

    return computed.visibility === "hidden" || computed.display === "none";
};

export default {
    ":focus": (node) => node === node.ownerDocument.activeElement,

    ":visible": (node) => !isHidden(node),

    ":hidden": isHidden
};
