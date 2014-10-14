import _ from "../util/index";
import { $Element } from "../types";
import SelectorMatcher from "../util/selectormatcher";

var rePrivateFunction = /^(?:on|do)[A-Z]/,
    ExtensionHandler = (selector, condition, mixins, index) => {
        var ctr = mixins.hasOwnProperty("constructor") && mixins.constructor,
            matcher = SelectorMatcher(selector),
            ext = (node, mock) => {
                var el = $Element(node);
                // mark extension as completed
                el._._extensions.push(index);

                if (mock === true || condition(el) !== false) {
                    // apply all private/public members to the interface
                    var privateFunctions = Object.keys(mixins).filter(function(prop) {
                        var method = mixins[prop];

                        if (rePrivateFunction.exec(prop)) {
                            // preserve context for private functions
                            el[prop] = () => method.apply(el, arguments);

                            return !mock;
                        }

                        el[prop] = method;
                    });

                    // invoke constructor if it exists
                    // make a safe call so live extensions can't break each other
                    if (ctr) _.safeInvoke(el, ctr);
                    // remove event handlers from element's interface
                    privateFunctions.forEach((prop) => { delete el[prop] });
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
