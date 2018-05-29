import { $Element } from "../element/index";
import { MethodError } from "../errors";

const REGEXP_SPACE = /[\n\t\r]/g;
const normalizedClass = node => (" " + node.className + " ").replace(REGEXP_SPACE, " ");

/**
 * Check if element contains a class name
 * @param  {String} className class name to verify
 * @return {Boolean} `true` if the element contains the class
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
 * @param  {...String} className class name to add
 * @return {$Element} Self
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
 * @param  {...String} className class name to remove
 * @return {$Element} Self
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
 * @param  {String} className class name to toggle
 * @param  {Boolean} [force] if `true` then adds the className; if `false` - removes it
 * @return {Boolean} `true` if the `className` is now present, and `false` otherwise.
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
