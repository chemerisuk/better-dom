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
            throw new MethodError(methodName, arguments);
        }

        if (content && typeof content === "string") {
            node.insertAdjacentHTML(fasterMethodName, content);
        } else {
            if (content || !fasterMethodName) strategy(node, content);
        }

        return this;
    };

DOM.register({
    /**
     * Insert HTMLString or {@link $Element} after the current element
     * @memberof! $Element#
     * @alias $Element#after
     * @param {Mixed} content HTMLString, {@link $Element}, Array.<{@link $Element}> or function
     * @return {$Element}
     * @function
     * @example
     * var link = DOM.create("a");  // <a></a>
     * link.after(DOM.create("b")); // <a></a><b></b>
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
     * @example
     * var link = DOM.create("a");   // <a></a>
     * link.before(DOM.create("b")); // <b></b><a></a>
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
     * @example
     * var link = DOM.create("a>`foo`"); // <a>foo</a>
     * link.prepend(DOM.create("b"));    // <a><b></b>foo</a>
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
     * @example
     * var link = DOM.create("a>`foo`"); // <a>foo</a>
     * link.append(DOM.create("b"));     // <a>foo<b></b></a>
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
     * @example
     * var div = DOM.create("div>span>`foo`");      // <div><span>foo</span></div>
     * div.child(0).replace(DOM.create("b>`bar`")); // <div><b>bar</b></div>
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
     * @example
     * var foo = DOM.find(".foo");
     * foo.remove();
     * DOM.contains(foo); // => false
     */
    remove: makeMethod("remove", "", false, (node) => {
        node.parentNode.removeChild(node);
    })
});
