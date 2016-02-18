import { safeCall } from "../util/index";
import { $Element } from "../types";
import SelectorMatcher from "../util/selectormatcher";

var propName = "<%= prop('extension') %>";

export default (selector, mixins, index) => {
    var matcher = SelectorMatcher(selector);

    return (node) => {
        var el = $Element(node),
            extensions = el._[propName],
            ctr;

        if (!extensions) {
            el._[propName] = extensions = [];
        }
        // skip previously invoked or mismatched elements
        if (~extensions.indexOf(index) || !matcher(node)) return;
        // mark extension as invoked
        extensions.push(index);
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
    };
};
