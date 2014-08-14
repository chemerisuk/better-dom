import _ from "./util/index";
import { DOCUMENT } from "./util/const";
import { $Element, DOM, MethodError } from "./index";

function makeManipulationMethod(methodName, fasterMethodName, standalone, strategy) {
    return function() {
        var args = arguments;

        return this.legacy((node, el, index, ref) => {
            if (!(standalone || node.parentNode && node.parentNode.nodeType === 1)) return;

            var html = "", value;

            _.each.call(args, (arg) => {
                if (typeof arg === "function") arg = arg(el, index, ref);

                if (typeof arg === "string") {
                    html += arg.trim();
                } else if (arg instanceof $Element) {
                    if (!value) value = DOCUMENT.createDocumentFragment();
                    // populate fragment
                    arg.legacy((node) => value.appendChild(node));
                } else {
                    throw new MethodError(methodName);
                }
            });

            if (!fasterMethodName && html) value = DOM.create(html)._._node;

            if (!fasterMethodName || value) {
                strategy(node, value);
            } else if (html) {
                node.insertAdjacentHTML(fasterMethodName, html);
            }
        });
    };
}

/**
 * Insert html string or $Element after the current
 * @memberof! $Element#
 * @alias $Element#after
 * @param {...Mixed} contents HTMLString, $Element or functor that returns content
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
 * @param {...Mixed} contents HTMLString, $Element or functor that returns content
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
 * @param {...Mixed} contents HTMLString, $Element or functor that returns content
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
 * @param {...Mixed} contents HTMLString, $Element or functor that returns content
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
