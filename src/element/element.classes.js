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

/**
 * Check if element contains class name
 * @memberof! $Element#
 * @alias $Element#hasClass
 * @param  {String}   className class name
 * @return {Boolean}  true if the element contains the class
 * @function
 */
$Element.prototype.hasClass = makeClassesMethod("contains", function(el, node, className) {
    return (" " + node.className + " ").replace(reSpace, " ").indexOf(" " + className + " ") >= 0;
});

/**
 * Add class(es) to element
 * @memberof! $Element#
 * @alias $Element#addClass
 * @param  {...String} classNames class name(s)
 * @return {$Element}
 * @function
 */
$Element.prototype.addClass = makeClassesMethod("add", function(el, node, className) {
    if (!el.hasClass(className)) node.className += " " + className;
});

/**
 * Remove class(es) from element
 * @memberof! $Element#
 * @alias $Element#removeClass
 * @param  {...String} classNames class name(s)
 * @return {$Element}
 * @function
 */
$Element.prototype.removeClass = makeClassesMethod("remove", function(el, node, className) {
    className = (" " + node.className + " ").replace(reSpace, " ").replace(" " + className + " ", " ");

    node.className = className.trim();
});

/**
 * Toggle a class on element
 * @memberof! $Element#
 * @alias $Element#toggleClass
 * @param  {String}  className class name(s)
 * @param  {Boolean} [force] if true then adds the className; if false - removes it
 * @return {Boolean} true if the className is now present, and false otherwise.
 * @function
 */
$Element.prototype.toggleClass = makeClassesMethod("toggle", function(el, node, className) {
    var oldClassName = node.className;

    el.addClass(className);

    if (oldClassName !== node.className) return true;

    el.removeClass(className);

    return false;
});
