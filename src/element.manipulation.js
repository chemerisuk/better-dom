var _ = require("./utils"),
    $Element = require("./element"),
    features = require("./features");

function makeManipulationMethod(methodName, fasterMethodName, standalone, strategy) {
    return function() {
        var args = arguments;

        return this.legacy(function(node, el, index) {
            if (!(standalone || node.parentNode && node.parentNode.nodeType === 1)) return;

            var html = "", value;

            _.forEach(args, function(arg) {
                if (typeof arg === "function") arg = arg(el, index);

                if (typeof arg === "string") {
                    html += DOM.template(arg).trim();
                } else if (arg instanceof $Element) {
                    if (html) {
                        html = _.parseFragment(html);

                        if (value) {
                            value.appendChild(html);
                        } else {
                            value = html;
                        }

                        html = "";
                    }

                    if (!value) value = document.createDocumentFragment();
                    // populate fragment
                    arg.legacy(function(node) { value.appendChild(node) });
                } else {
                    throw _.makeError(methodName, el);
                }
            });

            // always use _parseFragment because of HTML5 and NoScope bugs in legacy IE
            if (!(fasterMethodName && features.CSS3_ANIMATIONS) && html) value = _.parseFragment(html);

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
 * @param {...Mixed} contents HTMLString, EmmetString, $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.after = makeManipulationMethod("after", "afterend", false, function(node, relatedNode) {
    node.parentNode.insertBefore(relatedNode, node.nextSibling);
});

/**
 * Insert html string or $Element before the current
 * @param {...Mixed} contents HTMLString, EmmetString, $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.before = makeManipulationMethod("before", "beforebegin", false, function(node, relatedNode) {
    node.parentNode.insertBefore(relatedNode, node);
});

/**
 * Prepend html string or $Element to the current
 * @param {...Mixed} contents HTMLString, EmmetString, $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.prepend = makeManipulationMethod("prepend", "afterbegin", true, function(node, relatedNode) {
    node.insertBefore(relatedNode, node.firstChild);
});

/**
 * Append html string or $Element to the current
 * @param {...Mixed} contents HTMLString, EmmetString, $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.append = makeManipulationMethod("append", "beforeend", true, function(node, relatedNode) {
    node.appendChild(relatedNode);
});

/**
 * Replace current element with html string or $Element
 * @param {Mixed} content HTMLString, EmmetString, $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.replace = makeManipulationMethod("replace", "", false, function(node, relatedNode) {
    node.parentNode.replaceChild(relatedNode, node);
});

/**
 * Remove current element from DOM
 * @return {$Element}
 * @function
 */
$Element.prototype.remove = makeManipulationMethod("remove", "", false, function(node) {
    node.parentNode.removeChild(node);
});
