import _ from "../util/index";
import { $Element } from "../types";
import SelectorMatcher from "../util/selectormatcher";

var rePrivateFunction = /^(?:on|do)[A-Z]/;

export default (selector, condition, mixins, index) => {
    var ctr = mixins.hasOwnProperty("constructor") && mixins.constructor,
        matcher = SelectorMatcher(selector);

    return (node, mock) => {
        var el = $Element(node);
        // skip previously invoked or mismatched elements
        if (~el._._extensions.indexOf(index) || !matcher(node)) return;
        // mark extension as invoked
        el._._extensions.push(index);

        if (mock === true || condition(el) !== false) {
            // apply all private/public members to the element's interface
            var privateFunctions = Object.keys(mixins).filter((prop) => {
                var value = mixins[prop];
                // TODO: private functions are deprecated
                if (rePrivateFunction.exec(prop)) {
                    if (typeof value === "function") {
                        // preserve context for private functions
                        el[prop] = () => value.apply(el, arguments);
                    } else {
                        el[prop] = value;
                    }

                    return !mock;
                }

                if (typeof value === "object") {
                    if (value instanceof $Element) {
                        value = value.clone(true);
                    } else {
                        value = JSON.parse(JSON.stringify(value));
                    }
                }

                if (prop !== "constructor") {
                    el[prop] = value;

                    return !mock && prop[0] === "_";
                }
            });

            // invoke constructor if it exists
            // make a safe call so live extensions can't break each other
            if (ctr) _.safeInvoke(el, ctr);
            // remove event handlers from element's interface
            privateFunctions.forEach((prop) => { delete el[prop] });
        }
    };
};
