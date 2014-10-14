import _ from "../util/index";
import { DOCUMENT } from "../const";

var hooks = {};

hooks[":focus"] = (node) => node === DOCUMENT.activeElement;

hooks[":hidden"] = (node) => {
    if (node.getAttribute("aria-hidden") === "true") return true;

    var computed = _.computeStyle(node);

    return computed.visibility === "hidden" || computed.display === "none";
};

hooks[":visible"] = (node) => !hooks[":hidden"](node);

export default hooks;
