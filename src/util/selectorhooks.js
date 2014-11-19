import _ from "../util/index";
import { DOCUMENT } from "../const";

var hooks = {};

hooks[":focus"] = (node) => node === DOCUMENT.activeElement;

hooks[":hidden"] = (node, computed) => {
    computed = computed || _.computeStyle(node);

    return computed.visibility === "hidden" || computed.display === "none";
};

hooks[":visible"] = (node, computed) => !hooks[":hidden"](node, computed);

export default hooks;
