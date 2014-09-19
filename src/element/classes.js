import _ from "../helpers";
import { MethodError } from "../errors";
import { HTML } from "../constants";
import { $Element } from "../types";

var reSpace = /[\n\t\r]/g,
    makeMethod = (nativeMethodName, strategy) => {
        var methodName = nativeMethodName === "contains" ? "hasClass" : nativeMethodName + "Class";

        if (HTML.classList) {
            // use native classList property if possible
            strategy = function(token) {
                if (typeof token !== "string") throw new MethodError(methodName);

                return this[0].classList[nativeMethodName](token);
            };
        }

        if (methodName === "hasClass" || methodName === "toggleClass") {
            return function(token, force) {
                var node = this[0];

                if (node) {
                    if (typeof force === "boolean" && methodName === "toggleClass") {
                        this[force ? "addClass" : "removeClass"](token);

                        return force;
                    }

                    return strategy.call(this, token);
                }
            };
        } else {
            return function(...tokens) {
                var node = this[0];

                if (node) {
                    tokens.forEach(strategy, this);
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
    hasClass: makeMethod("contains", function(token) {
        if (typeof token !== "string") throw new MethodError("hasClass");

        return (" " + this[0].className + " ").replace(reSpace, " ").indexOf(" " + token + " ") >= 0;
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
    addClass: makeMethod("add", function(token) {
        if (!this.hasClass(token)) this[0].className += " " + token;
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
    removeClass: makeMethod("remove", function(token) {
        if (typeof token !== "string") throw new MethodError("removeClass");

        var node = this[0];

        node.className = (" " + node.className + " ").replace(reSpace, " ").replace(" " + token + " ", " ").trim();
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
    toggleClass: makeMethod("toggle", function(token) {
        var hasClass = this.hasClass(token);

        if (hasClass) {
            this.removeClass(token);
        } else {
            this[0].className += " " + token;
        }

        return !hasClass;
    })
});
