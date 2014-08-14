import _ from "../helpers";
import { DOCUMENT } from "../constants";
import { DOM } from "../types";

var hooks = {};

hooks[":focus"] = (node) => node === DOCUMENT.activeElement;

hooks[":hidden"] = (node, el) => {
    return node.getAttribute("aria-hidden") === "true" ||
        _.computeStyle(node).display === "none" || !DOM.contains(el);
};

hooks[":visible"] = (node, el) => !hooks[":hidden"](node, el);

export default hooks;
