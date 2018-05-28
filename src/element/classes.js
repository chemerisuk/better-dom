import { $Element } from "../element/index";
import { MethodError } from "../errors";

const REGEXP_SPACE = /[\n\t\r]/g;
const normalizedClass = node => (" " + node.className + " ").replace(REGEXP_SPACE, " ");

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
$Element.prototype.hasClass = function(className) {
    if (typeof className !== "string") {
        throw new MethodError("hasClass", arguments);
    }

    const node = this[0];
    if (!node) return false;

    if (node.classList) {
        return node.classList.contains(className);
    } else {
        return normalizedClass(node).indexOf(" " + className + " ") >= 0;
    }
};

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
$Element.prototype.addClass = function(...classNames) {
    const node = this[0];
    if (node) {
        classNames.forEach((className) => {
            if (typeof className !== "string") {
                throw new MethodError("addClass", arguments);
            }
            if (node.classList) {
                node.classList.add(className);
            } else if (!this.hasClass(className)) {
                this[0].className += " " + className;
            }
        });
    }

    return this;
};

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
$Element.prototype.removeClass = function(...classNames) {
    const node = this[0];
    if (node) {
        classNames.forEach((className) => {
            if (typeof className !== "string") {
                throw new MethodError("removeClass", arguments);
            }
            if (node.classList) {
                node.classList.remove(className);
            } else {
                node.className = normalizedClass(node).replace(" " + className + " ", " ").trim();
            }
        });
    }

    return this;
};

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
$Element.prototype.toggleClass = function(className, force) {
    if (typeof className !== "string") {
        throw new MethodError("toggleClass", arguments);
    }

    if (typeof force !== "boolean") {
        force = !this.hasClass(className);
    }

    const node = this[0];
    if (node) {
        if (force) {
            this.addClass(className);
        } else {
            this.removeClass(className);
        }
    }

    return force;
};
