import _ from "./util";
import DOM from "./index";
import { $Element, $Elements } from "./index";

var sandbox = document.createElement("body");

/**
 * Create a new DOM element in memory
 * @memberOf DOM
 * @param  {Mixed}  value     HTMLString or native element
 * @return {$Element|$Elements} element(s) wrapper
 */
DOM.create = function(value) {
    if (value.nodeType === 1) return $Element(value);

    if (typeof value !== "string") throw _.makeError("create", true);

    sandbox.innerHTML = value;

    for (var nodes = []; value = sandbox.firstChild; sandbox.removeChild(value)) {
        if (value.nodeType === 1) nodes.push(value);
    }

    if (nodes.length !== 1) return new $Elements(nodes);

    return new $Element(nodes[0]);
};
