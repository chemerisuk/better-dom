import _ from "../util/index";
import { DOCUMENT } from "../const";

var isHidden = (node) => {
    var computed = _.computeStyle(node);

    return computed.visibility === "hidden" || computed.display === "none";
};

export default {
    ":focus": (node) => node === DOCUMENT.activeElement,

    ":visible": (node) => !isHidden(node),

    ":hidden": isHidden
};
