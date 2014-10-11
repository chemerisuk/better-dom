import _ from "../util/index";
import { $Element } from "../types";
import SelectorMatcher from "../util/selectormatcher";

var rePrivateFunction = /^(?:on|do)[A-Z]/,
    ExtensionHandler = (selector, condition, mixins, index) => {
        var privateFunctions = _.keys(mixins).filter((prop) => !!rePrivateFunction.exec(prop)),
            ctr = mixins.hasOwnProperty("constructor") && mixins.constructor,
            matcher = SelectorMatcher(selector),
            ext = (node, mock) => {
                var el = $Element(node);
                // mark extension as completed
                el._._extensions.push(index);

                if (mock === true || condition(el) !== false) {
                    // apply all private/public members to the interface
                    _.assign(el, mixins);
                    // preserve this for private functions
                    privateFunctions.forEach((prop) => {
                        var fn = el[prop];

                        el[prop] = () => fn.apply(el, arguments);
                    });
                    // invoke constructor if it exists
                    // make a safe call so live extensions can't break each other
                    if (ctr) _.safeInvoke(el, ctr);
                    // remove event handlers from element's interface
                    privateFunctions.forEach((prop) => {
                        if (mock !== true) delete el[prop];
                    });
                }
            };

        ext.accept = (node, index) => {
            var el = $Element(node);

            return el._._extensions.indexOf(index) < 0 && matcher(node);
        };

        if (ctr) delete mixins.constructor;

        return ext;
    };

ExtensionHandler.traverse = (node) => (ext, index) => {
    // skip previously excluded or mismatched elements
    if (ext.accept(node, index)) ext(node);
};

export default ExtensionHandler;
