import _ from "../helpers";
import { HTML, DOCUMENT } from "../constants";

var hooks = {};

hooks[":focus"] = (node) => node === DOCUMENT.activeElement;

hooks[":hidden"] = (node) => !hooks[":visible"](node);

hooks[":visible"] = (node) => {
    return _.computeStyle(node).display !== "none" && HTML.contains(node);
};

export default hooks;
