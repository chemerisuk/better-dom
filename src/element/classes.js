import _ from "../util/index";
import { MethodError } from "../errors";
import { HTML } from "../const";
import { $Element } from "../types";

/* es6-transpiler has-iterators:false, has-generators: false */

var reSpace = /[\n\t\r]/g,
    makeMethod = (nativeMethodName, strategy) => {
        var methodName = nativeMethodName === "contains" ? "hasClass" : nativeMethodName + "Class";

        if (HTML.classList) {
            // use native classList property if possible
            strategy = function(el, token) {
                return el[0].classList[nativeMethodName](token);
            };
        }

        if (methodName === "hasClass" || methodName === "toggleClass") {
            return function(token, force) {
                if (this[0]) {
                    if (typeof force === "boolean" && methodName === "toggleClass") {
                        this[force ? "addClass" : "removeClass"](token);

                        return force;
                    }

                    if (typeof token !== "string") throw new MethodError(methodName);

                    return strategy(this, token);
                }
            };
        } else {
            return function() {
                var tokens = arguments;

                if (this[0]) {
                    for (var token of tokens) {
                        if (typeof token !== "string") throw new MethodError(methodName);

                        strategy(this, token);
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
     * @example
     * link.hasClass("foo");
     */
    hasClass: makeMethod("contains", (el, token) => {
        return (" " + el[0].className + " ")
            .replace(reSpace, " ").indexOf(" " + token + " ") >= 0;
    }),

    /**
     * Add class(es) to element
     * @memberof! $Element#
     * @alias $Element#addClass
     * @param  {...String} tokens class name(s)
     * @return {$Element}
     * @function
     * @example
     * link.addClass("foo");
     */
    addClass: makeMethod("add", (el, token) => {
        if (!el.hasClass(token)) el[0].className += " " + token;
    }),

    /**
     * Remove class(es) from element
     * @memberof! $Element#
     * @alias $Element#removeClass
     * @param  {...String} tokens class name(s)
     * @return {$Element}
     * @function
     * @example
     * link.removeCLass("foo");
     */
    removeClass: makeMethod("remove", (el, token) => {
        el[0].className = (" " + el[0].className + " ")
            .replace(reSpace, " ").replace(" " + token + " ", " ").trim();
    }),

    /**
     * Toggle a class on element
     * @memberof! $Element#
     * @alias $Element#toggleClass
     * @param  {String}  token class name
     * @param  {Boolean} [force] if <code>true</code> then adds the className; if <code>false</code> - removes it
     * @return {Boolean} returns <code>true</code> if the className is now present, and <code>false</code> otherwise.
     * @function
     * @example
     * link.toggleClass("foo");
     * link.toggleClass("bar", true);
     */
    toggleClass: makeMethod("toggle", (el, token) => {
        var hasClass = el.hasClass(token);

        if (hasClass) {
            el.removeClass(token);
        } else {
            el[0].className += " " + token;
        }

        return !hasClass;
    })
});
