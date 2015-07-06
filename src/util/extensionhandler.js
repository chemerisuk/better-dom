import { safeCall } from "../util/index";
import { $Element } from "../types";
import SelectorMatcher from "../util/selectormatcher";

export default (selector, condition, mixins, index) => {
    var matcher = SelectorMatcher(selector);

    return (node, mock) => {
        var el = $Element(node), ctr;
        // skip previously invoked or mismatched elements
        if (~el._["<%= prop('extension') %>"].indexOf(index) || !matcher(node)) return;
        // mark extension as invoked
        el._["<%= prop('extension') %>"].push(index);

        if (mock === true || condition(el) !== false) {
            // apply all element mixins
            Object.keys(mixins).forEach((prop) => {
                var value = mixins[prop];

                if (prop !== "constructor") {
                    el[prop] = value;
                } else {
                    ctr = value;
                }
            });

            // invoke constructor if it exists
            // make a safe call so live extensions can't break each other
            if (ctr) safeCall(el, ctr);
        }
    };
};
