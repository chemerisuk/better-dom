import { register, isArray } from "../util/index";
import { DOM, RETURN_THIS } from "../const";
import { $Element } from "../types";

register({
    /**
     * Insert HTMLString or {@link $Element} after the current element
     * @memberof! $Element#
     * @alias $Element#after
     * @param {...Mixed} contents HTMLString, {@link $Element}, Array.<{@link $Element}> or functor
     * @return {$Element}
     * @function
     * @example
     * var link = DOM.create("a");                   // <a></a>
     * link.after(DOM.create("b"));                  // <a></a><b></b>
     * link.after(DOM.create("i"), DOM.create("u")); // <a></a><b></b><i></i><u></u>
     */
    after: ["afterend", true, (node, relatedNode) => {
        node.parentNode.insertBefore(relatedNode, node.nextSibling);
    }],

    /**
     * Insert HTMLString or {@link $Element} before the current element
     * @memberof! $Element#
     * @alias $Element#before
     * @param {...Mixed} contents HTMLString, {@link $Element}, Array.<{@link $Element}> or functor
     * @return {$Element}
     * @function
     * @example
     * var link = DOM.create("a");                    // <a></a>
     * link.before(DOM.create("b"));                  // <b></b><a></a>
     * link.before(DOM.create("i"), DOM.create("u")); // <i></i><u></u><b></b><a></a>
     */
    before: ["beforebegin", true, (node, relatedNode) => {
        node.parentNode.insertBefore(relatedNode, node);
    }],

    /**
     * Prepend HTMLString or {@link $Element} to the current element
     * @memberof! $Element#
     * @alias $Element#prepend
     * @param {...Mixed} contents HTMLString, {@link $Element}, Array.<{@link $Element}> or functor
     * @return {$Element}
     * @function
     * @example
     * var link = DOM.create("a>`foo`");               // <a>foo</a>
     * link.prepend(DOM.create("b"));                  // <a><b></b>foo</a>
     * link.prepend(DOM.create("i"), DOM.create("u")); // <a><i></i><u></u><b></b>foo</a>
     */
    prepend: ["afterbegin", false, (node, relatedNode) => {
        node.insertBefore(relatedNode, node.firstChild);
    }],

    /**
     * Append HTMLString or {@link $Element} to the current element
     * @memberof! $Element#
     * @alias $Element#append
     * @param {...Mixed} contents HTMLString, {@link $Element}, Array.<{@link $Element}> or functor
     * @return {$Element}
     * @function
     * @example
     * var link = DOM.create("a>`foo`");              // <a>foo</a>
     * link.append(DOM.create("b"));                  // <a>foo<b></b></a>
     * link.append(DOM.create("i"), DOM.create("u")); // <a>foo<b></b><i></i><u></u></a>
     */
    append: ["beforeend", false, (node, relatedNode) => {
        node.appendChild(relatedNode);
    }],

    /**
     * Replace current element with HTMLString or {@link $Element}
     * @memberof! $Element#
     * @alias $Element#replace
     * @param {Mixed} content HTMLString, {@link $Element}, Array.<{@link $Element}> or functor
     * @return {$Element}
     * @function
     * @example
     * var div = DOM.create("div>span>`foo`");      // <div><span>foo</span></div>
     * div.child(0).replace(DOM.create("b>`bar`")); // <div><b>bar</b></div>
     */
    replace: ["", true, (node, relatedNode) => {
        node.parentNode.replaceChild(relatedNode, node);
    }],

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
    remove: ["", true, (node) => {
        node.parentNode.removeChild(node);
    }]
}, (methodName, fastStrategy, requiresParent, strategy) => function(...contents) {
    var node = this[0];

    if (requiresParent && !node.parentNode) return this;

    // the idea of the algorithm is to construct HTML string
    // when possible or use document fragment as a fallback to
    // invoke manipulation using a single method call
    var fragment = fastStrategy ? "" : node.ownerDocument.createDocumentFragment();

    contents.forEach((content) => {
        if (typeof content === "function") {
            content = content(this);
        }

        if (typeof content === "string") {
            if (typeof fragment === "string") {
                fragment += content.trim();
            } else {
                content = DOM.createAll(content);
            }
        } else if (content instanceof $Element) {
            content = [ content ];
        }

        if (isArray(content)) {
            if (typeof fragment === "string") {
                // append existing string to fragment
                content = DOM.createAll(fragment).concat(content);
                // fallback to document fragment strategy
                fragment = node.ownerDocument.createDocumentFragment();
            }

            content.forEach((el) => {
                fragment.appendChild(el[0]);
            });
        }
    });

    if (typeof fragment === "string") {
        node.insertAdjacentHTML(fastStrategy, fragment);
    } else {
        strategy(node, fragment);
    }

    return this;
}, () => RETURN_THIS);
