import _ from "../util/index";
import { HTML, DOCUMENT } from "../const";

var hooks = {};

hooks[":focus"] = (node) => node === DOCUMENT.activeElement;

hooks[":hidden"] = (node) => {
    if (node.getAttribute("aria-hidden") === "true") return true;

    var computed = _.computeStyle(node);

    return computed.visibility === "hidden" ||
        computed.display === "none" || !HTML.contains(node);
};

hooks[":visible"] = (node) => !hooks[":hidden"](node);

export default hooks;
