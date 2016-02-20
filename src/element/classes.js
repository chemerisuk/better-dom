import { register } from "../util/index";
import { HTML, RETURN_FALSE, RETURN_THIS } from "../const";
import { MethodError } from "../errors";

/* es6-transpiler has-iterators:false, has-generators: false */

var reSpace = /[\n\t\r]/g;

register({
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
    hasClass: [RETURN_FALSE, "contains", (el, token) => {
        return (" " + el[0].className + " ")
            .replace(reSpace, " ").indexOf(" " + token + " ") >= 0;
    }],

    /**
     * Add class(es) to element
     * @memberof! $Element#
     * @alias $Element#addClass
     * @param  {...String} tokens class name(s)
     * @return {$Element}
     * @function
     * @example
     * link.addClass("foo", "bar");
     */
    addClass: [RETURN_THIS, "add", (el, token) => {
        if (!el.hasClass(token)) el[0].className += " " + token;
    }],

    /**
     * Remove class(es) from element
     * @memberof! $Element#
     * @alias $Element#removeClass
     * @param  {...String} tokens class name(s)
     * @return {$Element}
     * @function
     * @example
     * link.removeClass("foo", "bar");
     */
    removeClass: [RETURN_THIS, "remove", (el, token) => {
        el[0].className = (" " + el[0].className + " ")
            .replace(reSpace, " ").replace(" " + token + " ", " ").trim();
    }],

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
    toggleClass: [RETURN_FALSE, "toggle", (el, token) => {
        var hasClass = el.hasClass(token);

        if (hasClass) {
            el.removeClass(token);
        } else {
            el[0].className += " " + token;
        }

        return !hasClass;
    }]
}, (methodName, defaultStrategy, nativeMethodName, strategy) => {
    /* istanbul ignore else  */
    if (HTML.classList) {
        // use native classList property if possible
        strategy = function(el, token) {
            return el[0].classList[nativeMethodName](token);
        };
    }

    if (defaultStrategy === RETURN_FALSE) {
        return function(token, force) {
            if (typeof force === "boolean" && nativeMethodName === "toggle") {
                this[force ? "addClass" : "removeClass"](token);

                return force;
            }

            if (typeof token !== "string") throw new MethodError(methodName, arguments);

            return strategy(this, token);
        };
    } else {
        return function() {
            for (var i = 0, n = arguments.length; i < n; ++i) {
                let token = arguments[i];

                if (typeof token !== "string") throw new MethodError(methodName, arguments);

                strategy(this, token);
            }

            return this;
        };
    }
}, (methodName, defaultStrategy) => defaultStrategy);
