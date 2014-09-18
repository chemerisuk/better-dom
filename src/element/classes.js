import _ from "../helpers";
import { MethodError } from "../errors";
import { HTML } from "../constants";
import { $Element } from "../types";

/* es6-transpiler has-iterators:false, has-generators: false */

var reSpace = /[\n\t\r]/g,
    makeClassesMethod = (nativeMethodName, fallback) => {
        var methodName = nativeMethodName === "contains" ? "hasClass" : nativeMethodName + "Class";
        // use fallback if browser does not support classList API
        if (!HTML.classList) nativeMethodName = null;

        if (methodName === "hasClass" || methodName === "toggleClass") {
            return function(token, force) {
                var node = this[0];

                if (node) {
                    if (typeof force === "boolean" && methodName === "toggleClass") {
                        this[force ? "addClass" : "removeClass"](token);

                        return force;
                    }

                    if (typeof token !== "string") throw new MethodError(methodName);

                    if (nativeMethodName) {
                        return node.classList[nativeMethodName](token);
                    } else {
                        return fallback(this, node, token);
                    }
                }
            };
        } else {
            return function() {
                var node = this[0],
                    args = arguments;

                if (node) {
                    for (let token of args) {
                        if (typeof token !== "string") throw new MethodError(methodName);

                        if (nativeMethodName) {
                            node.classList[nativeMethodName](token);
                        } else {
                            fallback(this, node, token);
                        }
                    }
                }

                return this;
            };
        }
    };

_.assign($Element.prototype, {
    /**
     * Check if element contains class name
     * @memberof! $Element#
     * @alias $Element#hasClass
     * @param  {String}   token class name
     * @return {Boolean}  returns <code>true</code> if the element contains the class
     * @function
     */
    hasClass: makeClassesMethod("contains", (el, node, token) => {
        return (" " + node.className + " ").replace(reSpace, " ").indexOf(" " + token + " ") >= 0;
    }),

    /**
     * Add class(es) to element
     * @memberof! $Element#
     * @alias $Element#addClass
     * @param  {...String} takens class name(s)
     * @return {$Element}
     * @function
     */
    addClass: makeClassesMethod("add", (el, node, token) => {
        if (!el.hasClass(token)) node.className += " " + token;
    }),

    /**
     * Remove class(es) from element
     * @memberof! $Element#
     * @alias $Element#removeClass
     * @param  {...String} takens class name(s)
     * @return {$Element}
     * @function
     */
    removeClass: makeClassesMethod("remove", (el, node, token) => {
        token = (" " + node.className + " ").replace(reSpace, " ").replace(" " + token + " ", " ");

        node.className = token.trim();
    }),

    /**
     * Toggle a class on element
     * @memberof! $Element#
     * @alias $Element#toggleClass
     * @param  {String}  token class name
     * @param  {Boolean} [force] if <code>true</code> then adds the className; if <code>false</code> - removes it
     * @return {Boolean} returns <code>true</code> if the className is now present, and <code>false</code> otherwise.
     * @function
     */
    toggleClass: makeClassesMethod("toggle", (el, node, token) => {
        var oldClassName = node.className;

        el.addClass(token);

        if (oldClassName !== node.className) return true;

        el.removeClass(token);

        return false;
    })
});
