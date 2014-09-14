import _ from "../helpers";
import { MethodError } from "../errors";
import { HTML } from "../constants";
import { $Element } from "../types";

/* es6-transpiler has-iterators:false, has-generators: false */

var reSpace = /[\n\t\r]/g;

function makeClassesMethod(nativeMethodName, fallback) {
    var methodName = nativeMethodName === "contains" ? "hasClass" : nativeMethodName + "Class";
    // use fallback if browser does not support classList API
    if (!HTML.classList) nativeMethodName = null;

    if (methodName === "hasClass" || methodName === "toggleClass") {
        return function(className, force) {
            var node = this[0];

            if (node) {
                if (typeof force === "boolean" && methodName === "toggleClass") {
                    this[force ? "addClass" : "removeClass"](className);

                    return force;
                }

                if (typeof className !== "string") throw new MethodError(methodName);

                if (nativeMethodName) {
                    return node.classList[nativeMethodName](className);
                } else {
                    return fallback(this, node, className);
                }
            }
        };
    } else {
        return function(className) {
            var node = this[0],
                args = arguments;

            if (node) {
                for (className of args) {
                    if (typeof className !== "string") throw new MethodError(methodName);

                    if (nativeMethodName) {
                        node.classList[nativeMethodName](className);
                    } else {
                        fallback(this, node, className);
                    }
                }
            }

            return this;
        };
    }
}

_.assign($Element.prototype, {
    /**
     * Check if element contains class name
     * @memberof! $Element#
     * @alias $Element#hasClass
     * @param  {String}   className class name
     * @return {Boolean}  returns <code>true</code> if the element contains the class
     * @function
     */
    hasClass: makeClassesMethod("contains", (el, node, className) => {
        return (" " + node.className + " ").replace(reSpace, " ").indexOf(" " + className + " ") >= 0;
    }),

    /**
     * Add class(es) to element
     * @memberof! $Element#
     * @alias $Element#addClass
     * @param  {...String} classNames class name(s)
     * @return {$Element}
     * @function
     */
    addClass: makeClassesMethod("add", (el, node, className) => {
        if (!el.hasClass(className)) node.className += " " + className;
    }),

    /**
     * Remove class(es) from element
     * @memberof! $Element#
     * @alias $Element#removeClass
     * @param  {...String} classNames class name(s)
     * @return {$Element}
     * @function
     */
    removeClass: makeClassesMethod("remove", (el, node, className) => {
        className = (" " + node.className + " ").replace(reSpace, " ").replace(" " + className + " ", " ");

        node.className = className.trim();
    }),

    /**
     * Toggle a class on element
     * @memberof! $Element#
     * @alias $Element#toggleClass
     * @param  {String}  className class name(s)
     * @param  {Boolean} [force] if <code>true</code> then adds the className; if <code>false</code> - removes it
     * @return {Boolean} returns <code>true</code> if the className is now present, and <code>false</code> otherwise.
     * @function
     */
    toggleClass: makeClassesMethod("toggle", (el, node, className) => {
        var oldClassName = node.className;

        el.addClass(className);

        if (oldClassName !== node.className) return true;

        el.removeClass(className);

        return false;
    })
});
