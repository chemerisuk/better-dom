import _ from "../util/index";
import { MethodError } from "../errors";
import { DOCUMENT } from "../const";
import { $Element, DOM } from "../types";

var makeMethod = (methodName, fasterMethodName, standalone, strategy) => function(content = "") {
    var node = this[0];

    if (!standalone && (!node.parentNode || content === DOM)) return this;

    if (typeof content === "function") content = content.call(this);

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

_.assign($Element.prototype, {
    /**
     * Insert HTMLString or {@link $Element} after the current element
     * @memberof! $Element#
     * @alias $Element#after
     * @param {Mixed} content HTMLString, {@link $Element}, Array.<{@link $Element}> or function
     * @return {$Element}
     * @function
     */
    after: makeMethod("after", "afterend", false, (node, relatedNode) => {
        node.parentNode.insertBefore(relatedNode, node.nextSibling);
    }),

    /**
     * Insert HTMLString or {@link $Element} before the current element
     * @memberof! $Element#
     * @alias $Element#before
     * @param {Mixed} content HTMLString, {@link $Element}, Array.<{@link $Element}> or function
     * @return {$Element}
     * @function
     */
    before: makeMethod("before", "beforebegin", false, (node, relatedNode) => {
        node.parentNode.insertBefore(relatedNode, node);
    }),

    /**
     * Prepend HTMLString or {@link $Element} to the current element
     * @memberof! $Element#
     * @alias $Element#prepend
     * @param {Mixed} content HTMLString, {@link $Element}, Array.<{@link $Element}> or function
     * @return {$Element}
     * @function
     */
    prepend: makeMethod("prepend", "afterbegin", true, (node, relatedNode) => {
        node.insertBefore(relatedNode, node.firstChild);
    }),

    /**
     * Append HTMLString or {@link $Element} to the current element
     * @memberof! $Element#
     * @alias $Element#append
     * @param {Mixed} content HTMLString, {@link $Element}, Array.<{@link $Element}> or function
     * @return {$Element}
     * @function
     */
    append: makeMethod("append", "beforeend", true, (node, relatedNode) => {
        node.appendChild(relatedNode);
    }),

    /**
     * Replace current element with HTMLString or {@link $Element}
     * @memberof! $Element#
     * @alias $Element#replace
     * @param {Mixed} content HTMLString, {@link $Element}, Array.<{@link $Element}> or function
     * @return {$Element}
     * @function
     */
    replace: makeMethod("replace", "", false, (node, relatedNode) => {
        node.parentNode.replaceChild(relatedNode, node);
    }),

    /**
     * Remove current element from the DOM
     * @memberof! $Element#
     * @alias $Element#remove
     * @return {$Element}
     * @function
     */
    remove: makeMethod("remove", "", false, (node) => {
        node.parentNode.removeChild(node);
    })
});
