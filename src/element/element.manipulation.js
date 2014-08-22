import _ from "../helpers";
import { MethodError } from "../errors";
import { DOCUMENT } from "../constants";
import { $Element, DOM } from "../types";

function makeManipulationMethod(methodName, fasterMethodName, standalone, strategy) {
    return function(content = "") {
        var node = this[0];

        if (!standalone && (!node.parentNode || content === DOM)) return this;

        if (typeof content === "function") content = content(this);

        if (typeof content === "string") {
            if (content) {
                // parse HTML string for the replace method
                if (fasterMethodName) {
                    content = content.trim();
                } else {
                    content = DOM.create(content)[0];
                }
            }
        } else if (content instanceof $Element) {
            content = content[0];
        } else if (_.isArray(content)) {
            content = content.reduce((fragment, el) => {
                fragment.appendChild(el[0]);

                return fragment;
            }, DOCUMENT.createDocumentFragment());
        } else {
            throw new MethodError(methodName);
        }

        if (content && typeof content === "string") {
            node.insertAdjacentHTML(fasterMethodName, content);
        } else {
            if (content || !fasterMethodName) strategy(node, content);
        }

        return this;
    };
}

/**
 * Insert html string or $Element after the current
 * @memberof! $Element#
 * @alias $Element#after
 * @param {Mixed} contents HTMLString, $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.after = makeManipulationMethod("after", "afterend", false, (node, relatedNode) => {
    node.parentNode.insertBefore(relatedNode, node.nextSibling);
});

/**
 * Insert html string or $Element before the current
 * @memberof! $Element#
 * @alias $Element#before
 * @param {Mixed} contents HTMLString, $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.before = makeManipulationMethod("before", "beforebegin", false, (node, relatedNode) => {
    node.parentNode.insertBefore(relatedNode, node);
});

/**
 * Prepend html string or $Element to the current
 * @memberof! $Element#
 * @alias $Element#prepend
 * @param {Mixed} contents HTMLString, $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.prepend = makeManipulationMethod("prepend", "afterbegin", true, (node, relatedNode) => {
    node.insertBefore(relatedNode, node.firstChild);
});

/**
 * Append html string or $Element to the current
 * @memberof! $Element#
 * @alias $Element#append
 * @param {Mixed} contents HTMLString, $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.append = makeManipulationMethod("append", "beforeend", true, (node, relatedNode) => {
    node.appendChild(relatedNode);
});

/**
 * Replace current element with html string or $Element
 * @memberof! $Element#
 * @alias $Element#replace
 * @param {Mixed} content HTMLString, $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.replace = makeManipulationMethod("replace", "", false, (node, relatedNode) => {
    node.parentNode.replaceChild(relatedNode, node);
});

/**
 * Remove current element from DOM
 * @memberof! $Element#
 * @alias $Element#remove
 * @return {$Element}
 * @function
 */
$Element.prototype.remove = makeManipulationMethod("remove", "", false, (node) => {
    node.parentNode.removeChild(node);
});
